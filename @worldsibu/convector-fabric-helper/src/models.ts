export interface Peer {
  url: string;
  msp: string;
}

export interface Admin {
  name: string;
  msp: string;
  mspName: string;
}

export interface ClientConfig {
  admin: Admin;
  peers: Peer[];
  orderer: Peer;
  channel: string;
  keyStore: string;
}
