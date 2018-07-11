/** @module @worldsibu/convector-adapter-fabric */

import { ControllerAdapter } from '@worldsibu/convector-core-adapter';
import { ClientHelper, ClientConfig, TxResult } from '@worldsibu/convector-common-fabric-helper';

export { TxResult };

export interface FabricConfig extends ClientConfig {
  chaincode: string;
}

export class FabricControllerAdapter extends ClientHelper implements ControllerAdapter {
  constructor(public config: FabricConfig) {
    super(config);
  }

  public async invoke(controller: string, name: string, adminOrUser?: string|true, ...args: any[]) {
    return super.invoke(`${controller}_${name}`, this.config.chaincode, adminOrUser, ...args);
  }
}
