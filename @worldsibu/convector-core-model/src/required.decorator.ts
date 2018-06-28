const requiredMetadataKey = Symbol('required');
import 'reflect-metadata';

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
  let required = {};

  try {
    required = Reflect.getMetadata(requiredMetadataKey, obj) || {};
  } catch (e) {
    // empty
  }

  return Object.keys(required)
    .every(k => !required[k] || obj[k] !== undefined);
}
