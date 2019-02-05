/** @module @worldsibu/convector-adapter-mock */

import * as uuid from 'uuid/v1';
import { Chaincode, IConfig } from '@worldsibu/convector-core-chaincode';
import { ChaincodeMockStub, Transform } from '@theledger/fabric-mock-stub';
import { ControllerAdapter } from '@worldsibu/convector-core-adapter';

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
    return await this.stub.mockInvoke(uuid(), [
      `${controller}_${name}`,
      ...args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString())
    ]);
  }
}
