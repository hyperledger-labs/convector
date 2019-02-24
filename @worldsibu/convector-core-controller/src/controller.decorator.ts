/** @module convector-core-controller */

import { ControllerInvalidError } from '@worldsibu/convector-core-errors';
import 'reflect-metadata';

/** @hidden */
const g: any = global;

/** @hidden */
export const controllerMetadataKey = g.ConvectorControllerMetadataKey || Symbol('controller');
g.ConvectorControllerMetadataKey = controllerMetadataKey;

/**
 * The controller decorator is used to pass the namespace context
 * to the [[Chaincode]] class.
 *
 * It's used at chaincode initialization to declare all the methods and avoid
 * method collision between controllers
 *
 * @decorator
 */
export function Controller(namespace: string) {
  return ctor => {
    if (typeof ctor !== 'function') {
      throw new ControllerInvalidError(namespace);
    }

    Reflect.defineMetadata(controllerMetadataKey, namespace, ctor);
  };
}
