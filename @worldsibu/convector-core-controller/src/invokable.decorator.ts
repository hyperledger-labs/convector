/** @module convector-core-controller */

import { Schema } from 'yup';
import { ClientIdentity } from 'fabric-shim';
import { StubHelper, ChaincodeError } from '@theledger/fabric-chaincode-utils';
import {
  ControllerNamespaceMissingError,
  ControllerInstantiationError,
  ControllerInvokablesMissingError,
  ControllerInvalidInvokeError,
  ControllerInvalidArgumentError,
  ControllerArgumentParseError,
  ControllerInvalidFunctionError
} from '@worldsibu/convector-core-errors';
import 'reflect-metadata';

import { paramMetadataKey } from './param.decorator';
import { controllerMetadataKey } from './controller.decorator';

const g: any = global;

/** @hidden */
export const invokableMetadataKey = g.ConvectorInvokableMetadataKey || Symbol('invokable');
g.ConvectorInvokableMetadataKey = invokableMetadataKey;

/**
 * Used to expose a function inside a controller
 * to be called from the outside world.
 *
 * The logic behind this decorators involves validating the amount of parameters
 * expected against the ones received.
 *
 * It also injects the [[ConvectorController.sender]] information.
 *
 * @decorator
 */
export function Invokable() {
  return (
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>
  ) => {
    const fn = descriptor.value!;

    if (typeof fn !== 'function') {
      throw new ControllerInvalidFunctionError();
    }

    const invokables = Reflect.getMetadata(invokableMetadataKey, target.constructor) || {};
    Reflect.defineMetadata(invokableMetadataKey, {
      ...invokables,
      [key]: true
    }, target.constructor);

    // The use of `function` here is necessary to keep the context of `this`
    descriptor.value = async function internalFn(
      this: any,
      stubHelper: StubHelper,
      args: string[]
    ) {
      const schemas: [Schema<any>, any, { new(...args: any[]): any }][] =
        Reflect.getOwnMetadata(paramMetadataKey, target, key);

      if (schemas) {
        if (schemas.length !== args.length) {
          throw new ControllerInvalidInvokeError(key, args.length, schemas.length);
        }

        args = await schemas.reduce(async (result, [schema, opts, model], index) => {
          let paramResult;

          try {
            if (opts.update) {
              paramResult = schema.cast(args[index], opts);
            } else {
              paramResult = await schema.validate(args[index], opts);
            }
          } catch (e) {
            throw new ControllerInvalidArgumentError(e, index, args[index]);
          }

          if (model) {
            try {
              paramResult = new model(JSON.parse(args[index]));
            } catch (e) {
              throw new ControllerArgumentParseError(e, index, args[index]);
            }
          }

          return [...await result, paramResult];
        }, Promise.resolve([]));
      }

      const identity = new ClientIdentity(stubHelper.getStub());
      const namespace = Reflect.getMetadata(controllerMetadataKey, target.constructor);
      const ctx = Object.create(this[namespace], { sender: { value: identity.getX509Certificate().fingerPrint } });

      try {
        return await fn.call(ctx, ...args);
      } catch (e) {
        const error = new ChaincodeError(e.message);
        error.stack = e.stack;
        throw error;
      }
    };
  };
}

/**
 * Return all the invokable methods of a controller
 *
 * The controller gets registered in the chaincode using its namespace,
 * just for further references.
 *
 * @hidden
 *
 * @param controller
 */
export function getInvokables(controller: { new(...args: any[]): any }): any {
  let obj: any;
  let namespace: string;
  let invokables: any[];

  try {
    namespace = Reflect.getMetadata(controllerMetadataKey, controller);

    if (!namespace) {
      throw new TypeError();
    }
  } catch (e) {
    throw new ControllerNamespaceMissingError(e, controller.name);
  }

  try {
    obj = new controller();
  } catch (e) {
    throw new ControllerInstantiationError(e, namespace);
  }

  try {
    invokables = Reflect.getMetadata(invokableMetadataKey, controller);

    if (!invokables) {
      throw new TypeError();
    }
  } catch (e) {
    throw new ControllerInvokablesMissingError(e, namespace);
  }

  return Object.keys(invokables)
    .reduce((result, k) => ({
      ...result,
      [`${namespace}_${k}`]: obj[k]
    }), { [namespace]: obj });
}
