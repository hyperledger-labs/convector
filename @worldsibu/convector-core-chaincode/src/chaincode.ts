/** @module convector-core-chaincode */

import { Stub } from 'fabric-shim';
import { getInvokables } from '@worldsibu/convector-core-controller';
import { BaseStorage } from '@worldsibu/convector-core-storage';
import { StubStorage } from '@worldsibu/convector-storage-stub';
import { Chaincode as CC, StubHelper, ChaincodeError } from '@theledger/fabric-chaincode-utils';
import {
  ChaincodeInitializationError,
  ChaincodeInvokationError,
  ConfigurationInvalidError
} from '@worldsibu/convector-core-errors';

import { Config } from './config';

/**
 * The Chaincode class is used as a wrapper of controllers in a blockchain.
 *
 * The chaincode must be initialized first with the list of controllers
 * provided in the configuration object.
 *
 * The controllers must follow the
 * [[ConvectorController]] specification.
 */
export class Chaincode extends CC {
  /**
   * Standard Init from Hyperledger Fabric
   */
  public async Init(stub: Stub) {
    return await super.Init(stub)
      .catch(e => {
        const err = new ChaincodeInitializationError(e);
        throw new ChaincodeError(err.toString());
      });
  }

  /**
   * Standard Invoke from Hyperledger Fabric.
   *
   * This method is invoked when you want to call any function in the controller,
   * it first calls this function
   */
  public async Invoke(stub: Stub) {
    BaseStorage.current = new StubStorage(stub);
    return await super.Invoke(stub)
      .catch(e => {
        const err = new ChaincodeInvokationError(e);
        throw new ChaincodeError(err.toString());
      });
  }

  /**
   * This is where the chaincode gets initialized. The list of controllers
   * gets initialized and registered in this chaincode version.
   *
   * Notice that if you upgrade from/to another chaincode, you can change the
   * controllers present without any problem
   */
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
