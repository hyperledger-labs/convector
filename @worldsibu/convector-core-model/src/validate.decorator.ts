/** @module convector-core-model */
// tslint:disable:no-invalid-this

import { Schema } from 'yup';
import 'reflect-metadata';

const validateMetadataKey = Symbol('validate');

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

    const validated = Reflect.getMetadata(validateMetadataKey, target);
    Reflect.defineMetadata(validateMetadataKey, {
      ...validated,
      [key]: true
    }, target);
  };
}

export function getValidatedProperties(obj: any) {
  let validated = {};

  try {
    validated = Reflect.getMetadata(validateMetadataKey, obj) || {};
  } catch (e) {
    // empty
  }

  return Object.keys(validated);
}
