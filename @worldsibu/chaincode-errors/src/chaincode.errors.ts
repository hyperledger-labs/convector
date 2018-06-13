import { BaseError } from './base.error';
import { chaincodeSideMessage } from './common';

export class ChaincodeInitializationError extends BaseError {
  public code = 'CC_INIT_ERR';
  public description = 'There was a problem while starting the chaincode';
  public explanation = `
    ${chaincodeSideMessage}`;

  constructor(public original: Error) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ChaincodeInvokationError extends BaseError {
  public code = 'CC_IVK_ERR';
  public description = 'There was a problem while invoking the chaincode';
  public explanation = `
    ${chaincodeSideMessage}`;

  constructor(public original: Error) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}
