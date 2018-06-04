import { Schema } from 'yup';

export function Validate<T>(schema: Schema<T>) {
  return (target: any, key: string) => {
    let val;
    const setter = target.__lookupSetter__(key) || (v => v);

    if (!setter) {
      delete target[key];
    }

    Object.defineProperty(target, key, {
      get: () => val,
      set: newVal => val = schema.validateSync(setter(newVal)),
      enumerable: true,
      configurable: true
    });
  };
}
