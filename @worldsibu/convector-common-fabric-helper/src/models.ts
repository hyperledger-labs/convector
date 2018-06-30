/** @module @worldsibu/convector-common-fabric-helper */

export interface Peer {
  url: string;
  msp: string;
  events?: string;
}

export interface Admin {
  name: string;
  msp: string;
  mspName: string;
  keyStore?: string;
}

export interface ClientConfig {
  admin: Admin;
  peers: Peer[];
  orderer: Peer;
  channel: string;
  keyStore?: string;
  txTimeout: number;
}

export interface TxResult {
  txId: string;
  code: string;
}
