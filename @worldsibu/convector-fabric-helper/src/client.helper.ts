import { dirname, join } from 'path';
import * as Client from 'fabric-client';
import { readFileSync, readdirSync } from 'fs';

import { Admin, ClientConfig, Peer } from './models';

export class ClientHelper {
  public client = new Client();

  public config: ClientConfig;

  private admin: Client.User;

  private _orderer: Client.Orderer;
  public get orderer() {
    if (this._orderer) {
      return this._orderer;
    }

    this._orderer = this.client.newOrderer(this.config.orderer.url);
    return this._orderer;
  }

  private _channel: Client.Channel;
  public get channel() {
    if (this._channel) {
      return this._channel;
    }

    this._channel = this.client.newChannel(this.config.channel);
    this._channel.addOrderer(this.orderer);
    this.peers.forEach(peer => this._channel.addPeer(peer));

    return this._channel;
  }

  private _peers: Client.Peer[];
  public get peers() {
    if (this._peers) {
      return this._peers;
    }

    this._peers = this.config.peers.map(peer => this.client.newPeer(peer.url));
    return this._peers;
  }

  public async init(config: ClientConfig): Promise<void> {
    this.config = config;

    const cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({ path: this.config.keyStore }));
    this.client.setCryptoSuite(cryptoSuite);

    const store = await Client.newDefaultKeyValueStore({ path: this.config.keyStore });
    this.client.setStateStore(store);

    const adminMsp = this.config.admin.msp;
    const keyStore = join(adminMsp, 'keystore');
    const adminCerts = join(adminMsp, 'admincerts');
    const privateKeyFile = readdirSync(keyStore)[0];
    const certFile = readdirSync(adminCerts)[0];

    this.admin = await this.client.createUser({
      skipPersistence: true,
      username: `chaincode-admin`,
      mspid: this.config.admin.mspName,
      cryptoContent: {
        privateKey: join(keyStore, privateKeyFile),
        signedCert: join(adminCerts, certFile)
      }
    });

    await this.client.setUserContext(this.admin);
  }
}
