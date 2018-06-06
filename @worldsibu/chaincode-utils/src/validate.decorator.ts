import { Schema } from 'yup';

export function Validate<T>(schema: Schema<T>) {
  return (target: any, key: string) => {
    const setter = target.__lookupSetter__(key) || (v => v);

    if (!setter) {
      delete target[key];
    }

    Object.defineProperty(target, key, {
      get() {
        // tslint:disable-next-line:no-invalid-this
        return this[`_${key}`];
      },
      set(newVal) {
        // tslint:disable-next-line:no-invalid-this
        this[`_${key}`] = schema.validateSync(setter(newVal));
      },
      enumerable: true,
      configurable: true
    });
  };
}
