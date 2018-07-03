/** @module @worldsibu/convector-common-fabric-helper */
import { join } from 'path';
import * as Client from 'fabric-client';
import { readdirSync } from 'fs';

import { ClientConfig, TxResult } from './models';

export class ClientHelper {
  public client = new Client();

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

    this._peers = this.config.peers.map(peer => {
      const pem = readdirSync(join(peer.msp, 'msp/tlscacerts'))[0];
      return this.client.newPeer(peer.url, { pem });
    });

    return this._peers;
  }

  constructor(public config: ClientConfig) { }

  public async init(): Promise<void> {
    const adminMsp = this.config.admin!.msp;
    const keyStore = join(adminMsp, 'msp/keystore');
    const adminCerts = join(adminMsp, 'msp/admincerts');
    const privateKeyFile = readdirSync(keyStore)[0];
    const certFile = readdirSync(adminCerts)[0];

    const commonKeyStore = this.config.keyStore || this.config.admin!.keyStore || keyStore;

    const cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({ path: commonKeyStore }));
    this.client.setCryptoSuite(cryptoSuite);

    const store = await Client.newDefaultKeyValueStore({ path: commonKeyStore });
    this.client.setStateStore(store);

    this.admin = await this.client.createUser({
      skipPersistence: true,
      username: `chaincode-admin`,
      mspid: this.config.admin!.mspName,
      cryptoContent: {
        privateKey: join(keyStore, privateKeyFile),
        signedCert: join(adminCerts, certFile)
      }
    });

    await this.channel.initialize();
    await this.client.setUserContext(this.admin);
  }

  public async invoke(fcn: string, chaincodeId: string, ...args: any[]) {
    const { proposalResponse, txId } = await this.sendTransactionProposal({ fcn, chaincodeId, args });
    return await this.processProposal(proposalResponse, txId);
  }

  public async processProposal(
    proposalResponse: {
      proposal: Client.Proposal,
      proposalResponses: Client.ProposalResponse[],
    },
    txId: Client.TransactionId
  ) {
    const txRequest = this.channel.sendTransaction(proposalResponse);
    const txListener = this.listenTx(txId.getTransactionID());

    return await this.processTx(txRequest, txListener);
  }

  public async listenTx(txId: string) {
    const hub = this.client.newEventHub();

    hub.setPeerAddr(this.config.peers[0].events, {});
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
    const txId = this.client.newTransactionID();

    request.args = request.args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());

    const [ proposalResponses, proposal ] =
      await this.channel.sendInstantiateProposal(
        { ...request, txId } as Client.ChaincodeInstantiateUpgradeRequest,
        this.config.txTimeout
      );

    if (!proposalResponses.every(pr => pr.response && pr.response.status === 200)) {
      const err = new Error('Transaction proposal was bad');
      err['responses'] = proposalResponses;

      throw err;
    }

    return {
      txId,
      result: proposalResponses[0],
      proposalResponse: { proposalResponses, proposal }
    };
  }

  public async sendUpgradeProposal(request: {
    [k in keyof Client.ChaincodeInstantiateUpgradeRequest]?: Client.ChaincodeInstantiateUpgradeRequest[k]
  }) {
    const txId = this.client.newTransactionID();

    request.args = request.args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());

    const [ proposalResponses, proposal ] =
      await await this.channel.sendUpgradeProposal(
        { ...request, txId } as Client.ChaincodeInstantiateUpgradeRequest,
        this.config.txTimeout
      );

    if (!proposalResponses.every(pr => pr.response && pr.response.status === 200)) {
      const err = new Error('Transaction proposal was bad');
      err['responses'] = proposalResponses;

      throw err;
    }

    return {
      txId,
      result: proposalResponses[0],
      proposalResponse: { proposalResponses, proposal }
    };
  }

  public async sendTransactionProposal(request: {
    [k in keyof Client.ChaincodeInvokeRequest]?: Client.ChaincodeInvokeRequest[k]
  }) {
    const txId = this.client.newTransactionID();

    request.args = request.args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());

    const [ proposalResponses, proposal ] =
      await this.channel.sendTransactionProposal(
        { ...request, txId } as Client.ChaincodeInvokeRequest,
        this.config.txTimeout
      );

    if (!proposalResponses.every(pr => pr.response && pr.response.status === 200)) {
      const err = new Error('Transaction proposal was bad');
      err['responses'] = proposalResponses;

      throw err;
    }

    return {
      txId,
      result: proposalResponses[0],
      proposalResponse: { proposalResponses, proposal }
    };
  }

  public async processTx(
    txRequest: Promise<Client.BroadcastResponse>,
    txListener: Promise<TxResult>
  ) {
    const [ tx, response ] = await Promise.all([ txRequest, txListener ]);

    if (!tx || tx.status !== 'SUCCESS' || !response || response.code !== 'VALID') {
      const err = new Error(`Transaction failed. Status ${tx.status}. Response ${response.code}`);
      Object.assign(err, { tx, response });
      throw err;
    }

    return response.txId;
  }
}
