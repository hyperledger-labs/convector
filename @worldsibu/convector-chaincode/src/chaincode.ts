import { Stub } from 'fabric-shim';
import { getInvokables } from '@worldsibu/convector-controller';
import { BaseStorage } from '@worldsibu/convector-base-storage';
import { StubStorage } from '@worldsibu/convector-stub-storage';
import { Chaincode as CC, StubHelper, ChaincodeError } from '@theledger/fabric-chaincode-utils';
import {
  ChaincodeInitializationError,
  ChaincodeInvokationError,
  ConfigurationInvalidError
} from '@worldsibu/convector-errors';

import { Config } from './config';

export class Chaincode extends CC {
  public async Init(stub: Stub) {
    return await super.Init(stub)
      .catch(e => {
        const err = new ChaincodeInitializationError(e);
        throw new ChaincodeError(err.toString());
      });
  }

  public async Invoke(stub: Stub) {
    BaseStorage.current = new StubStorage(stub);
    return await super.Invoke(stub)
      .catch(e => {
        const err = new ChaincodeInvokationError(e);
        throw new ChaincodeError(err.toString());
      });
  }

  public async initControllers(stub: StubHelper, args: string[]) {
    let config: Config;

    try {
      const configObj = JSON.parse(args[0]);
      config = new Config(configObj);
    } catch (e) {
      throw new ConfigurationInvalidError(e);
    }

    const controllers = await config.getControllers();

    controllers.forEach(C => Object.assign(this, getInvokables(C)));
  }
}
