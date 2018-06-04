export const controllerMetadataKey = Symbol('controller');

export function Controller(namespace: string) {
  return ctor => Reflect.defineMetadata(controllerMetadataKey, namespace, ctor);
}
