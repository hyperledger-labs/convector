/** @module @worldsibu/convector-common-fabric-helper */

export interface ClientConfig {
  user?: string;
  channel?: string;
  txTimeout: number;
  skipInit?: boolean;
  networkProfile: string;
}

export interface TxListenerResult {
  txId: string;
  code: string;
}

export enum Status {
  UNKNOWN = 'UNKNOWN',
  SUCCESS = 'SUCCESS',
  BAD_REQUEST = 'BAD_REQUEST',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  REQUEST_ENTITY_TOO_LARGE = 'REQUEST_ENTITY_TOO_LARGE',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export interface TxResult {
  info: string;
  txId: string;
  code: string;
  status: Status;
}
