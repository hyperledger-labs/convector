import { resolve } from 'path';
import { rejects } from 'assert';
import * as Client from 'fabric-client';
import { ControllerAdapter } from '@worldsibu/convector-core-adapter';
import { ClientHelper, Peer, ClientConfig } from '@worldsibu/convector-common-fabric-helper';

export { Peer };

export interface FabricConfig extends ClientConfig {
  chaincode: string;
}

export class FabricControllerAdapter extends ClientHelper implements ControllerAdapter {
  constructor(public config: FabricConfig) {
    super(config);
  }

  public async invoke(controller: string, name: string, ...args: any[]) {
    return super.invoke(`${controller}_${name}`, this.config.chaincode, ...args);
  }
}
