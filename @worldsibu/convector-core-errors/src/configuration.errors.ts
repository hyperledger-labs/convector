/** @module @worldsibu/convector-core-errors */

import { BaseError } from './base.error';
import { chaincodeSideMessage } from './common';

export class ConfigurationInvalidError extends BaseError {
  public code = 'CFG_INV_ERR';
  public description = 'The chaincode configuration is not valid';
  public explanation = `
    ${chaincodeSideMessage}`;

  constructor(public original: Error) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ConfigurationParseError extends BaseError {
  public code = 'CFG_PARS_ERR';
  public description = 'The configuration object cannot be parsed';
  public explanation = `
    There might be an error in your json, it seems to be invalid

    ${this.json}

    ${chaincodeSideMessage}`;

  constructor(public original: Error, public json: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ConfigurationFileOpenError extends BaseError {
  public code = 'CFG_OPN_ERR';
  public description = 'The configuration file cannot be opened';
  public explanation = `
    Failed to open or read ${this.file}
    Make sure the file you provided is exists and is the current user has the necessary permissions to read it
    ${chaincodeSideMessage}`;

  constructor(public original: Error, public file: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}
