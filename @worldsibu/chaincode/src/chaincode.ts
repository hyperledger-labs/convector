import { Stub } from 'fabric-shim';
import { getInvokables } from '@worldsibu/chaincode-utils';
import { BaseStorage } from '@worldsibu/chaincode-base-storage';
import { StubStorage } from '@worldsibu/chaincode-stub-storage';
import { Chaincode as CC, StubHelper } from '@theledger/fabric-chaincode-utils';

import { Config } from './config';

export class Chaincode extends CC {
  public async Init(stub: Stub) {
    return await super.Init(stub);
  }

  public async Invoke(stub: Stub) {
    BaseStorage.current = new StubStorage(stub);
    return await super.Invoke(stub);
  }

  public async initControllers(stub: StubHelper, args: string[]) {
    const configObj = JSON.parse(args[0]);
    const config = new Config(configObj);
    const controllers = await config.getControllers();
    controllers.forEach(C => Object.assign(this, getInvokables(C)));
  }
}
