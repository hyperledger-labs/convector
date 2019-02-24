/** @module convector-core-model */
// tslint:disable:no-invalid-this

import { Schema } from 'yup';
import 'reflect-metadata';

const g: any = global;

export const validateMetadataKey = g.ConvectorValidateMetadataKey || Symbol('validate');
g.ConvectorValidateMetadataKey = validateMetadataKey;

export function Validate<T>(input: Schema<T>|{ schema: () => Schema<T>}) {
  let schema = input as Schema<T>;

  if ('schema' in input) {
    schema = input.schema();
  }

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
      [key]: schema
    }, target);
  };
}

export function getPropertiesValidation(obj: any) {
  let validated = {};

  try {
    validated = Reflect.getMetadata(validateMetadataKey, obj) || {};
  } catch (e) {
    // empty
  }

  return validated;
}

export function getValidatedProperties(obj: any) {
  return Object.keys(getPropertiesValidation(obj));
}
