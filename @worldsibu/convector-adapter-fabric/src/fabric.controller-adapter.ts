/** @module @worldsibu/convector-adapter-fabric */

import { ControllerAdapter } from '@worldsibu/convector-core-adapter';
import { ClientHelper, Peer, ClientConfig } from '@worldsibu/convector-common-fabric-helper';

export { Peer };

export interface FabricConfig extends ClientConfig {
  user: string;
  chaincode: string;
}

export class FabricControllerAdapter extends ClientHelper implements ControllerAdapter {
  constructor(public config: FabricConfig) {
    super(config);
  }

  public async invoke(controller: string, name: string, ...args: any[]) {
    const userContext = await this.client.getUserContext(this.config.user, true);
    await this.client.setUserContext(userContext, true);

    return super.invoke(`${controller}_${name}`, this.config.chaincode, ...args);
  }
}
