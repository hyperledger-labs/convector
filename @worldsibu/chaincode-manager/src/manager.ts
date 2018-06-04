import { dirname, join } from 'path';
import * as Client from 'fabric-client';
import { readFileSync, readdirSync } from 'fs';
import { IConfig as ControllersConfig } from '@worldsibu/chaincode';

// 5 minutes - this might be too much
const TIMEOUT = 300000;
const client = new Client();

export interface Peer {
  url: string;
  msp: string;
}

export interface Admin {
  name: string;
  msp: string;
  mspName: string;
}

export interface ManagerConfig {
  policy: any;
  admin: Admin;
  peers: Peer[];
  orderer: Peer;
  channel: string;
  keyStore: string;
  worldsibuNpmToken: string;
  controllers: ControllersConfig[];
}

export class Manager {
  public static readConfig(path: string): ManagerConfig {
    let config: ManagerConfig;

    try {
      config = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
      throw new Error('{INVALID} Failed to read tellus config file');
    }

    config.admin.msp = join(dirname(path), config.admin.msp);
    config.orderer.msp = join(dirname(path), config.orderer.msp);

    config.peers = config.peers.map(peer => ({
      ...peer,
      msp: join(dirname(path), peer.msp)
    }));

    return config;
  }

  public static extractError(err: string): { status: number, message: string }|void {
    if (!/chaincode error/.test(err)) {
      return;
    }

    const [, status, message] = err.match(/chaincode error \(status: (\d+), message: ([^)]*)\)/);

    return { status: parseInt(status, 10), message };
  }

  public static getCCName(packageName: string): string {
    return packageName.replace(/@worldsibu\//, '');
  }

  public config: ManagerConfig;

  private _orderer: Client.Orderer;
  private get orderer() {
    if (this._orderer) {
      return this._orderer;
    }

    this._orderer = client.newOrderer(this.config.orderer.url);
    return this._orderer;
  }

  private _channel: Client.Channel;
  private get channel() {
    if (this._channel) {
      return this._channel;
    }

    this._channel = client.newChannel(this.config.channel);
    this._channel.addOrderer(this.orderer);
    this.peers.forEach(peer => this._channel.addPeer(peer));

    return this._channel;
  }

  private _peers: Client.Peer[];
  private get peers() {
    if (this._peers) {
      return this._peers;
    }

    this._peers = this.config.peers.map(peer => client.newPeer(peer.url));
    return this._peers;
  }

  public async init(config: ManagerConfig): Promise<void> {
    this.config = config;

    const cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({ path: this.config.keyStore }));
    client.setCryptoSuite(cryptoSuite);

    const store = await Client.newDefaultKeyValueStore({ path: this.config.keyStore });
    client.setStateStore(store);

    const adminMsp = join(this.config.admin.msp, 'msp');
    const keyStore = join(adminMsp, 'keystore');
    const adminCerts = join(adminMsp, 'admincerts');
    const privateKeyFile = readdirSync(keyStore)[0];
    const certFile = readdirSync(adminCerts)[0];

    const adminUser = await client.createUser({
      skipPersistence: true,
      username: `chaincode-admin`,
      mspid: this.config.admin.mspName,
      cryptoContent: {
        privateKey: join(keyStore, privateKeyFile),
        signedCert: join(adminCerts, certFile)
      }
    });

    await client.setUserContext(adminUser);
  }

  public async install(
    name: string,
    version: string,
    path: string
  ): Promise<void> {
    const peers = this.peers;

    await client.installChaincode({
      txId: client.newTransactionID(true),
      targets: peers,
      chaincodeId: name,
      chaincodePath: path,
      chaincodeType: 'node',
      chaincodeVersion: version
    })
      .then(() => console.log('Installed successfully'))
      .catch((e) => console.log('Error during installation', e.err));
  }

  public async instantiate(
    name: string,
    version: string,
    ...args: string[]
  ): Promise<void> {
    const channel = this.channel;
    await channel.initialize();

    const proposalResponse = await channel.sendInstantiateProposal({
      args,
      fcn: 'init',
      chaincodeId: name,
      chaincodeVersion: version,
      txId: client.newTransactionID(),
      'endorsement-policy': this.config.policy
    }, TIMEOUT);

    await channel.sendTransaction({
      proposalResponses: proposalResponse[0],
      proposal: proposalResponse[1]
    });

    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('Instantiated successfully');
  }

  public async upgrade(
    name: string,
    version: string,
    ...args: string[]
  ): Promise<void> {
    const channel = this.channel;
    await channel.initialize();

    const proposalResponse = await channel.sendUpgradeProposal({
      args,
      chaincodeId: name,
      chaincodeVersion: version,
      txId: client.newTransactionID(),
      'endorsement-policy': this.config.policy
    }, TIMEOUT);

    await channel.sendTransaction({
      proposalResponses: proposalResponse[0],
      proposal: proposalResponse[1]
    });

    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('Upgraded successfully');
  }

  public async invoke(
    name: string,
    fcn: string,
    user = 'admin',
    ...args: string[]
  ): Promise<void> {
    const channel = this.channel;
    await channel.initialize();

    const userContext = await client.getUserContext(user, true);
    await client.setUserContext(userContext, true);

    const proposalResponse = await channel.sendTransactionProposal({
      fcn,
      args,
      chaincodeId: name,
      txId: client.newTransactionID()
    }, TIMEOUT);

    await channel.sendTransaction({
      proposalResponses: proposalResponse[0],
      proposal: proposalResponse[1]
    });

    console.log('Invocated successfully');
  }
}
