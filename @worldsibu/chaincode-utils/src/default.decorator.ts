const defaultMetadataKey = Symbol('default');

export function Default<T>(defaultValue: T) {
  return (target: any, key: string) => {
    const defaults = Reflect.getMetadata(defaultMetadataKey, target);

    Reflect.defineMetadata(defaultMetadataKey, {
      ...defaults,
      [key]: defaultValue
    }, target);
  };
}

export function getDefaults(obj: any) {
  const defaults = Reflect.getMetadata(defaultMetadataKey, obj);

  return Object.keys(defaults)
    .reduce((result, k) => ({
      ...result,
      [k]: typeof defaults[k] === 'function' ? defaults[k]() : defaults[k]
    }), {});
}
