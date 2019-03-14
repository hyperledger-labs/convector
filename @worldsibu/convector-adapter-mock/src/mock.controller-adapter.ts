/** @module @worldsibu/convector-adapter-mock */

import * as uuid from 'uuid/v1';
import { ControllerAdapter } from '@worldsibu/convector-core-adapter';
import { Chaincode, IConfig } from '@worldsibu/convector-core-chaincode';
import { ChaincodeMockStub, Transform } from '@theledger/fabric-mock-stub';

// Remove when this gets merged
// https://github.com/wearetheledger/fabric-node-chaincode-utils/pull/23
import { Transform as _Transform } from '@theledger/fabric-chaincode-utils';
_Transform.isObject = data => data !== null && typeof data === 'object';

export class MockControllerAdapter implements ControllerAdapter {
  public stub = new ChaincodeMockStub('Participant', new Chaincode());

  public async init(config: IConfig[]) {
    await this.stub.mockInit(uuid(), []);
    await this.stub.mockInvoke(uuid(), ['initControllers', JSON.stringify(config)]);
  }

  public async getById<T>(id: string): Promise<T> {
    const response = await this.stub.getState(id);
    return Transform.bufferToObject(response) as any;
  }

  public async invoke(controller: string, name: string, adminOrUser?: string|true, ...args: any[]) {
    const response = await this.stub.mockInvoke(uuid(), [
      `${controller}_${name}`,
      ...args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString())
    ]);

    return Transform.bufferToObject(response.payload);
  }
}
