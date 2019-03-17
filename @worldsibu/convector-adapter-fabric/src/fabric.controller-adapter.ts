/** @module @worldsibu/convector-adapter-fabric */

import { ControllerAdapter } from '@worldsibu/convector-core';
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
    const txResult = await super.invoke(`${controller}_${name}`, this.config.chaincode, config, ...args);
    return txResult.result;
  }

  public async query(controller: string, name: string, config?: any, ...args: any[]): Promise<any> {
    const txResult = await super.query(`${controller}_${name}`, this.config.chaincode, config, ...args);
    return txResult.result;
  }
}
