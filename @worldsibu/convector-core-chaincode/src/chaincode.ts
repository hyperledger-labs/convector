/** @module convector-core-chaincode */

import { Stub, ClientIdentity } from 'fabric-shim';
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

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

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
  // This is a temporal flag to avoid initialize the controllers twice
  // This class is actually gonna be disposed and created multiple times without warning
  private initialized = false;

  /**
   * Standard Init from Hyperledger Fabric
   */
  public async Init(stub: Stub) {
    const response = await super.Init(stub)
      .catch(e => {
        const err = new ChaincodeInitializationError(e);
        throw new ChaincodeError(err.toString());
      });

    return response;
  }

  /**
   * Standard Invoke from Hyperledger Fabric.
   *
   * This method is invoked when you want to call any function in the controller,
   * it first calls this function
   */
  public async Invoke(stub: Stub) {
    BaseStorage.current = new StubStorage(stub);

    await this.initControllers(new StubHelper(stub), [, 'true']);

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
    // Don't initialize if already initialized or if config is in param
    if (this.initialized && !args[0]) {
      return;
    }

    const config = await this.getConfig(stub, args[0], !!args[1]);

    if (!config) {
      return;
    }

    const controllers = await config.getControllers();
    const identity = new ClientIdentity(stub.getStub());
    const fingerprint = identity.getX509Certificate().fingerPrint;

    controllers.forEach(C => {
      const invokables = getInvokables(C);

      const injectedInvokables = Object.keys(invokables)
        .reduce((result, fnName) => ({
          ...result,
          [fnName]: isFunction(invokables[fnName]) ?
            (stubHelper: StubHelper, _args: string[]) =>
              invokables[fnName].call(this, stubHelper, _args, {
                sender: {
                  value: fingerprint
                },
                tx: {
                  value: {
                    identity,
                    stub
                  }
                }
              }) :
            invokables[fnName]
        }), {});
      return Object.assign(this, injectedInvokables);
    });

    this.initialized = true;
  }

  /**
   * Get the config from the ledger and fallback to load if from file
   *
   * @param stub
   * @param refreshOrConfig If true, read the config from file and ignore the
   *                        ledger value useful after an upgrade.
   *                        The value might be the config to fallback if nothing is found
   * @param dontThrow       Don't throw an exception if the config is not found
   */
  private async getConfig(stub: StubHelper, refreshOrConfig: string, dontThrow = false): Promise<Config> {
    if (refreshOrConfig !== 'true') {
      try {
        const ledgerConfig = await stub.getStateAsObject(this.name) as any;

        if (ledgerConfig) {
          console.log('Found config in ledger', ledgerConfig);
        }

        const config = Array.isArray(ledgerConfig) ? ledgerConfig : ledgerConfig.controllers;

        return new Config(config);
      } catch (e) {
        // empty
      }
    }

    try {
      const config = Config.readFromFile();

      console.log('Found config in package', config.dump());
      await stub.putState(this.name, { controllers: config.dump() });

      return config;
    } catch (e) {
      if (refreshOrConfig && refreshOrConfig === 'true' && !dontThrow) {
        throw new ConfigurationInvalidError(e);
      }
    }

    try {
      const paramConfig = JSON.parse(refreshOrConfig);

      console.log('Found config in param', paramConfig);
      await stub.putState(this.name, paramConfig);

      return new Config(paramConfig);
    } catch (e) {
      if (!dontThrow) {
        throw new ConfigurationInvalidError(e);
      }
    }
  }
}
