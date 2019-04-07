/** @module @worldsibu/convector-core-errors */

import { BaseError } from './base.error';

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
    const firstResWithErr = responses.find(res => res.error);
    this.message = super.getMessage(firstResWithErr ?
      firstResWithErr.error instanceof Error ?
        firstResWithErr.error.stack :
        JSON.stringify(firstResWithErr.error) :
      this.getOriginal()
    );
  }
}
