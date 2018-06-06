// tslint:disable:no-invalid-this

import { Schema } from 'yup';

export function Validate<T>(schema: Schema<T>) {
  return (target: any, key: string) => {
    const setter = target.__lookupSetter__(key) || (v => v);

    if (!setter) {
      delete target[key];
    }

    Object.defineProperty(target, key, {
      get() {
        return this[`_${key}`];
      },
      set(newVal) {
        this[`_${key}`] = schema.validateSync(setter.call(this, newVal));
      },
      enumerable: true,
      configurable: true
    });
  };
}
