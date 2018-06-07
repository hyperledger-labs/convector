// tslint:disable:no-invalid-this

import { Schema } from 'yup';

export function Validate<T>(schema: Schema<T>) {
  return (target: any, key: string) => {
    const getSet = {
      get() {
        return this[`_${key}`];
      },
      set(newVal) {
        let setter = target.__lookupSetter__(key);
        setter = !setter || setter === getSet.set ? (v => v) : setter;

        this[`_${key}`] = schema.validateSync(setter.call(this, newVal));
      },
      enumerable: true,
      configurable: true
    };

    Object.defineProperty(target, key, getSet);
  };
}
