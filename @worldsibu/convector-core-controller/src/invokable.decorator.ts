/** @module convector-core-controller */

import { Schema } from 'yup';
import * as g from 'window-or-global';
import {
  ControllerNamespaceMissingError,
  ControllerInvokablesMissingError,
  ControllerInvalidInvokeError,
  ControllerInvalidArgumentError,
  ControllerArgumentParseError,
  ControllerInvalidFunctionError
} from '@worldsibu/convector-core-errors';
import 'reflect-metadata';

import { paramMetadataKey } from './param.decorator';
import { ConvectorController } from './convector-controller';
import { controllerMetadataKey } from './controller.decorator';

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
      // This used to be the stub param, deprecated now
      _: any,
      args: string[],
      extras: any = {},
      ...rest: any[]
    ) {
      // This is a local chaincode call, pass through
      if ('_internal_invokable' in this) {
        return fn.call(this, _, args, extras, ...rest);
      }

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

      const namespace = Reflect.getMetadata(controllerMetadataKey, target.constructor);
      const ctx = Object.create(this[namespace], {...extras, _internal_invokable: {value:true}});

      try {
        return await fn.call(ctx, ...args);
      } catch (e) {
        const error = new Error(e.message);
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
export function getInvokables(controller: new(...args: any[]) => ConvectorController): {
  invokables: { [k: string]: (new(...args: any[]) => ConvectorController) };
  namespace: string;
} {
  let namespace: string;
  let invokables: any;

  try {
    namespace = Reflect.getMetadata(controllerMetadataKey, controller);

    if (!namespace) {
      throw new TypeError();
    }
  } catch (e) {
    throw new ControllerNamespaceMissingError(e, controller.name);
  }

  try {
    invokables = Reflect.getMetadata(invokableMetadataKey, controller);

    if (!invokables) {
      throw new TypeError();
    }
  } catch (e) {
    throw new ControllerInvokablesMissingError(e, namespace);
  }

  return {
    invokables,
    namespace
  };
}
