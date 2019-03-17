/** @module @worldsibu/convector-common-fabric-helper */
import { safeLoad } from 'js-yaml';
import { resolve, join } from 'path';
import * as Client from 'fabric-client';
import { ensureDir, ensureFile, readdir, readFile } from 'fs-extra';

import { ClientConfig, TxResult, TxListenerResult } from './models';

export class ClientHelper {
  public client: Client;
  public user: Client.User;
  public config: ClientConfig;
  public channel: Client.Channel;

  private _organizations: string[];
  public get organizations() {
    // If this was already initialized return the result
    if (this._organizations) {
      return this._organizations;
    }

    return this.channel ?
      this.channel.getOrganizations()
        .map((org: any) => org.id as string) :
      this.networkConfig.getOrganizations()
        .map(org => org.getMspid());
  }

  private _channels: (Client.Channel & { name: string })[];
  public get channels() {
    if (this._channels) {
      return this._channels;
    }

    const channels = Object.keys(this.networkConfig._network_config.channels);
    this._channels = channels.map(name => {
      const ch: any = this.client.getChannel(name);
      ch.name = ch._name;
      return ch;
    });

    return this._channels;
  }

  public get networkConfig(): any {
    return (this.client as any)._network_config as Client;
  }

  private $initializing: Promise<void>;

  constructor(config: ClientConfig) {
    this.config = {
      txTimeout: 300000,
      skipInit: false,
      ...config
    };

    if (!this.config.skipInit) {
      this.$initializing = this.init();
    }
  }

  public async init(initKeyStore = false) {
    if (this.$initializing) {
      return await this.$initializing;
    }

    this.client = new Client();

    // The client needs to create the user credentials based on the CA key/cert
    if (initKeyStore) {
      const stateStore = await Client.newDefaultKeyValueStore({ path: this.config.keyStore });
      this.client.setStateStore(stateStore);

      const cryptoSuite = Client.newCryptoSuite();
      const cryptoStore = Client.newCryptoKeyStore({ path: this.config.keyStore });

      cryptoSuite.setCryptoKeyStore(cryptoStore);
      this.client.setCryptoSuite(cryptoSuite);

      const mspPath = resolve(process.cwd(), this.config.userMspPath);

      try {
        await ensureDir(mspPath);
      } catch (e) {
        throw new Error(`The userMspPath ${mspPath} is not reachable or not a directory`);
      }

      await this.client.createUser({
        skipPersistence: false,
        mspid: this.config.userMsp,
        username: this.config.user,
        cryptoContent: {
          privateKeyPEM: await this.readSingleFileInDir(join(mspPath, 'keystore')),
          signedCertPEM: await this.readSingleFileInDir(join(mspPath, 'signcerts'))
        }
      });
    }

    if (typeof this.config.networkProfile === 'string') {
      try {
        const profileStr =
          await readFile(resolve(process.cwd(), this.config.networkProfile), 'utf8');

        if (/\.json$/.test(this.config.networkProfile)) {
          this.config.networkProfile = JSON.parse(profileStr);
        } else {
          this.config.networkProfile = safeLoad(profileStr);
        }
      } catch (e) {
        throw new Error(
          `Failed to read or parse the network profile at '${this.config.networkProfile}', ${e.toString()}`
        );
      }
    }

    const { organizations } = this.config.networkProfile as any;

    await Promise
      .all(Object.keys(organizations)
        .map(async name => {
          const org = organizations[name];

          if (org.adminPrivateKey && org.signedCert) {
            org.adminPrivateKey.path = await this.getLonelyFile(org.adminPrivateKey.path);
            org.signedCert.path = await this.getLonelyFile(org.signedCert.path);
          }
        }));

    // add here this.client.setTlsClientCertAndKey

    this.client.loadFromConfig(this.config.networkProfile);

    await this.client.initCredentialStores();

    if (this.config.user) {
      await this.useUser(this.config.user);
    }

    if (this.config.channel) {
      await this.useChannel(this.config.channel);
    }
  }

  public async useUser(name: string) {
    this.user = await this.client.getUserContext(name, true);
    await this.client.setUserContext(this.user);
  }

  public async useChannel(name: string) {
    this.channel = this.channels.find(ch => ch.name === name);

    await this.channel.initialize();

    return this.channel;
  }

  public async invoke(
    fcn: string,
    chaincodeId: string,
    adminOrUser: string | true = this.config.user,
    ...args: any[]
  ) {
    const useAdmin = adminOrUser === true;

    if (!useAdmin) {
      await this.useUser(adminOrUser as string);
    }

    const { proposalResponse } = await this.sendTransactionProposal({ fcn, chaincodeId, args }, useAdmin);
    return await this.processProposal(proposalResponse);
  }

  public async processProposal(
    proposalResponse: {
      proposal: Client.Proposal,
      proposalResponses: Client.ProposalResponse[],
      txId: Client.TransactionId
    }
  ): Promise<TxResult> {
    const txRequest = this.channel.sendTransaction(proposalResponse);
    const txListener = this.listenTx(proposalResponse.txId.getTransactionID());

    const txResult = await this.processTx(txRequest, txListener);
    let result: any = proposalResponse.proposalResponses[0].response.payload;

    try {
      result = JSON.parse(result);
    } catch (err) {
      // This error is expected and harmless
    }

    return {
      ...txResult,
      result
    };
  }

  public async listenTx(txId: string): Promise<TxListenerResult> {
    const hub = this.channel.getChannelEventHubsForOrg()[0];
    hub.connect();

    return await new Promise<{ txId: string, code: string }>((res, rej) => {
      const timeout = setTimeout(() => {
        hub.disconnect();
        const seconds = this.config.txTimeout / 1000;
        rej(new Error(`Transaction did not complete within ${seconds} seconds`));
      }, this.config.txTimeout);

      hub.registerTxEvent(txId, (tx, code) => {
        clearTimeout(timeout);
        hub.unregisterTxEvent(txId);
        hub.disconnect();

        if (code !== 'VALID') {
          return rej(new Error(`Problem with the transaction. Event status ${code}`));
        }

        res({ txId, code });
      });
    });
  }

  public async sendInstantiateProposal(request: {
    [k in keyof Client.ChaincodeInstantiateUpgradeRequest]?: Client.ChaincodeInstantiateUpgradeRequest[k]
  }) {
    const txId = this.client.newTransactionID(true);

    request.args = request.args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());

    const [proposalResponses, proposal] =
      await this.channel.sendInstantiateProposal(
        { ...request, txId } as Client.ChaincodeInstantiateUpgradeRequest,
        this.config.txTimeout
      );

    if (!proposalResponses.every((pr: Client.ProposalResponse) => pr.response && pr.response.status === 200)) {
      const err = new Error('Transaction proposal was bad');
      err['responses'] = proposalResponses;

      throw err;
    }

    return {
      result: proposalResponses[0] as Client.ProposalResponse,
      proposalResponse: {
        txId,
        proposal,
        proposalResponses: proposalResponses as Client.ProposalResponse[]
      }
    };
  }

  public async sendUpgradeProposal(request: {
    [k in keyof Client.ChaincodeInstantiateUpgradeRequest]?: Client.ChaincodeInstantiateUpgradeRequest[k]
  }) {
    const txId = this.client.newTransactionID(true);

    request.args = request.args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());

    const [proposalResponses, proposal] =
      await await this.channel.sendUpgradeProposal(
        { ...request, txId } as Client.ChaincodeInstantiateUpgradeRequest,
        this.config.txTimeout
      );

    if (!proposalResponses.every((pr: Client.ProposalResponse) => pr.response && pr.response.status === 200)) {
      const err = new Error('Transaction proposal was bad');
      err['responses'] = proposalResponses;

      throw err;
    }

    return {
      result: proposalResponses[0] as Client.ProposalResponse,
      proposalResponse: {
        txId,
        proposal,
        proposalResponses: proposalResponses as Client.ProposalResponse[]
      }
    };
  }

  public async sendTransactionProposal(request: {
    [k in keyof Client.ChaincodeInvokeRequest]?: Client.ChaincodeInvokeRequest[k]
  }, useAdmin = false) {
    const txId = this.client.newTransactionID(useAdmin);

    request.args = (request.args || []).map(arg => {
      if (!arg) {
        // tslint:disable-next-line:max-line-length
        throw new Error('Undefined parameters received as part of the transaction, check how the function is being called');
      }
      return typeof arg === 'object' ? JSON.stringify(arg) : arg.toString();
    });

    const [proposalResponses, proposal] =
      await this.channel.sendTransactionProposal(
        { ...request, txId } as Client.ChaincodeInvokeRequest,
        this.config.txTimeout
      );

    if (!proposalResponses.every((pr: Client.ProposalResponse) => pr.response && pr.response.status === 200)) {
      const err = new Error('Transaction proposal was bad');
      err['responses'] = proposalResponses;

      throw err;
    }

    return {
      result: proposalResponses[0] as Client.ProposalResponse,
      proposalResponse: {
        txId,
        proposal,
        proposalResponses: proposalResponses as Client.ProposalResponse[]
      }
    };
  }

  public async processTx(
    txRequest: Promise<Client.BroadcastResponse>,
    txListener: Promise<TxListenerResult>
  ): Promise<TxResult> {
    const [tx, response] = await Promise.all([txRequest, txListener]);

    if (!tx || tx.status !== 'SUCCESS' || !response || response.code !== 'VALID') {
      const err = new Error(`Transaction failed. Status ${tx.status}. Response ${response.code}`);
      Object.assign(err, { tx, response });
      throw err;
    }

    return {
      ...tx,
      ...response
    } as TxResult;
  }

  private async readSingleFileInDir(dirPath: string) {
    try {
      await ensureDir(dirPath);
    } catch (e) {
      throw new Error(`The directory ${dirPath} is not reachable or not a directory`);
    }

    const content = await readdir(dirPath);

    if (content.length !== 1) {
      throw new Error(
        `The directory ${dirPath} is supposed to only have one file, but found ${content.length}`
      );
    }

    return await readFile(join(dirPath, content[0]), 'utf8');
  }

  private async getLonelyFile(folderPath: string): Promise<string> {
    folderPath = resolve(folderPath);

    const isFile = await ensureFile(folderPath)
      .then(() => Promise.resolve(true))
      .catch(() => Promise.resolve(false));

    const isDir = await ensureDir(folderPath)
      .then(() => Promise.resolve(true))
      .catch(() => Promise.resolve(false));

    if (isFile) {
      return folderPath;
    }

    if (!isDir) {
      throw new Error(`Path '${folderPath}' neither a file or a directory`);
    }

    const content = await readdir(folderPath);

    if (content.length !== 1) {
      throw new Error(`Directory '${folderPath}' must contain only one file, but contains ${content.length}`);
    }

    return join(folderPath, content[0]);
  }
}
