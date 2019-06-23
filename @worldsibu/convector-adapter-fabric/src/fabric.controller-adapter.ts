/** @module @worldsibu/convector-adapter-fabric */

import { ControllerAdapter, ClientResponseError } from '@worldsibu/convector-core';
import { ClientHelper, ClientConfig, TxResult } from '@worldsibu/convector-common-fabric-helper';

export { TxResult };

export interface FabricConfig extends ClientConfig {
  chaincode: string;
}

export class FabricControllerAdapter extends ClientHelper implements ControllerAdapter {
  constructor(public config: FabricConfig) {
    super(config);
  }

  public async invoke(controller: string, name: string, config?: any, ...args: any[]): Promise<any> {
    try {
      return await super.invoke(`${controller}_${name}`, this.config.chaincode, config, ...args);
    } catch (err) {
      if (!err.responses) {
        throw err;
      }

      let errors: any;

      try {
        errors = err.responses
          .map(response => ({
            response,
            error: JSON.parse(response.message.replace(/^.+\{/, '{'))
          }));
      } catch (e) {
        throw new ClientResponseError(err.responses.map(error => ({
          error,
          response: error
        })));
      }

      throw new ClientResponseError(errors);
    }
  }

  public async query(controller: string, name: string, config?: any, ...args: any[]): Promise<any> {
    return super.query(`${controller}_${name}`, this.config.chaincode, config, ...args);
  }
}
