import * as Client from 'fabric-client';
import { ControllerAdapter } from '@worldsibu/convector-core-adapter';

export interface Peer {
  url: string;
  msp: string;
}

export interface FabricConfig {
  user: string;
  peers: Peer[];
  orderer: Peer;
  channel: string;
  chaincode: string;
  txTimeout?: number;
  cryptoStore: string;
}

export class FabricControllerAdapter implements ControllerAdapter {
  private client = new Client();

  private _orderer: Client.Orderer;
  private get orderer() {
    if (this._orderer) {
      return this._orderer;
    }

    this._orderer = this.client.newOrderer(this.config.orderer.url);
    return this._orderer;
  }

  private _channel: Client.Channel;
  private get channel() {
    if (this._channel) {
      return this._channel;
    }

    this._channel = this.client.newChannel(this.config.channel);
    this._channel.addOrderer(this.orderer);
    this.peers.forEach(peer => this._channel.addPeer(peer));

    return this._channel;
  }

  private _peers: Client.Peer[];
  private get peers() {
    if (this._peers) {
      return this._peers;
    }

    this._peers = this.config.peers.map(peer => this.client.newPeer(peer.url));
    return this._peers;
  }

  constructor(private config: FabricConfig) {
    this.config.txTimeout = this.config.txTimeout || 300000;
  }

  public async init() {
    const cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({ path: this.config.cryptoStore }));
    this.client.setCryptoSuite(cryptoSuite);

    const store = await Client.newDefaultKeyValueStore({ path: this.config.cryptoStore });
    this.client.setStateStore(store);

    const userContext = await this.client.getUserContext(this.config.user, true);
    await this.client.setUserContext(userContext, true);

    await this.channel.initialize();
  }

  public async invoke(controller: string, name: string, ...args: any[]) {
    const proposalResponse = await this.channel.sendTransactionProposal({
      fcn: `${controller}_${name}`,
      args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString()),
      chaincodeId: this.config.chaincode,
      txId: this.client.newTransactionID()
    }, this.config.txTimeout);

    await this.channel.sendTransaction({
      proposalResponses: proposalResponse[0],
      proposal: proposalResponse[1]
    });
  }
}
