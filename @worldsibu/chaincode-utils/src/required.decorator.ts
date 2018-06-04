const requiredMetadataKey = Symbol('required');

export function Required() {
  return (target: any, key: string) => {
    const required = Reflect.getMetadata(requiredMetadataKey, target);

    Reflect.defineMetadata(requiredMetadataKey, {
      ...required,
      [key]: true
    }, target);
  };
}

export function ensureRequired(obj: any) {
  const required = Reflect.getMetadata(requiredMetadataKey, obj);

  return Object.keys(required)
    .every(k => !required[k] || obj[k] !== undefined);
}
