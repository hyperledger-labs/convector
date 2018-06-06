import { Schema } from 'yup';
import { ClientIdentity } from 'fabric-shim';
import { StubHelper, ChaincodeError } from '@theledger/fabric-chaincode-utils';

import { paramMetadataKey } from './param.decorator';
import { controllerMetadataKey } from './controller.decorator';

const invokableMetadataKey = Symbol('invokable');

export function Invokable() {
  return (
    target: any,
    key: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>
  ) => {
    const fn = descriptor.value!;

    const invokables = Reflect.getMetadata(invokableMetadataKey, target.constructor);
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

      if (schemas.length !== args.length) {
        throw new Error(`Arguments mistmatch, fn ${key} called ` +
          `with ${args.length} params but ${schemas.length} expected`);
      }

      if (schemas) {
        args = await schemas.reduce(async (result, [schema, opts, model], index) => {
          let paramResult;

          try {
            if (opts.update) {
              paramResult = schema.cast(args[index], opts);
            } else {
              paramResult = await schema.validate(args[index], opts);
            }

            if (model) {
              paramResult = new model(JSON.parse(args[index]));
            }
          } catch (e) {
            throw new Error(`Invalid param #${index} using value ${args[index]}, ${e.message}`);
          }

          return [...await result, paramResult];
        }, Promise.resolve([]));
      }

      const identity = new ClientIdentity(stubHelper.getStub());
      const ctx = Object.create(this, { sender: { value: identity.getX509Certificate().fingerPrint } });

      try {
        return await fn.call(ctx, ...args);
      } catch (e) {
        throw new ChaincodeError(e.message, undefined, e.stack);
      }
    };
  };
}

export function getInvokables(controller: { new(...args: any[]): any }): any {
  const namespace = Reflect.getMetadata(controllerMetadataKey, controller);
  const obj = new controller();

  return Object.keys(Reflect.getMetadata(invokableMetadataKey, controller))
    .reduce((invokables, k) => ({ ...invokables, [`${namespace}_${k}`]: obj[k] }), {});
}
