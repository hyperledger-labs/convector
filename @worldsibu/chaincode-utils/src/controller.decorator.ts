import { ControllerInvalidError } from '@worldsibu/chaincode-errors';

export const controllerMetadataKey = Symbol('controller');

export function Controller(namespace: string) {
  return ctor => {
    if (typeof ctor !== 'function') {
      throw new ControllerInvalidError(namespace);
    }

    Reflect.defineMetadata(controllerMetadataKey, namespace, ctor);
  };
}
