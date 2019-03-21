/** @module @worldsibu/convector-core-errors */

import { BaseError } from './base.error';
import { chaincodeSideMessage } from './common';

export interface ClientChaincodeResponse {
  error?: any;
  response?: any;
}

export class ClientResponseError extends BaseError {
  public code = 'CLIENT_RES_ERR';
  public description = 'There was a problem while invoking the chaincode';
  public explanation = `Chaincode error, this is a wrapper around the responses`;

  constructor(public responses: ClientChaincodeResponse[]) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}
