/** @module convector-core-controller */

import * as g from 'window-or-global';
import { Schema, object } from 'yup';
import 'reflect-metadata';

/** @hidden */
const isSchema = (schema: any): schema is Schema<any> => 'validate' in schema;

/** @hidden */
export const paramMetadataKey = g.ConvectorParamMetadataKey || Symbol('param');
g.ConvectorParamMetadataKey = paramMetadataKey;

/**
 * Used to identify and parse the parameters when a function is invokable in the chaincode.
 *
 * HLF invokes the functions using an array of strings, so no matter what type
 * of data you sent when calling the function, it will be converted to a string.
 *
 * This decorator is used to parse the arguments using [yup](https://github.com/jquense/yup)
 * for the data validation.
 *
 * [[ConvectorModel]] can be used as well instead of a yup schema.
 *
 * @decorator
 *
 * @param model Can be either a [[ConvectorModel]] or a [yup schema](https://github.com/jquense/yup#mixed)
 * @param opts Check out the
 *  [validate options](https://github.com/jquense/yup#mixedvalidatevalue-any-options-object-promiseany-validationerror)
 */
export function Param<T>(
  model: Schema<T>|{ new(...args: any[]): T },
  opts: any = { context: {} }
) {
  return (target: any, propertyKey: string, parameterIndex: number) => {

    const schemas: [Schema<any>, any, { new(...args: any[]): T }] =
      Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];

    const schema = isSchema(model) ? model : object()
      .transform(value => value instanceof model ? value : new model(value));

    schemas[parameterIndex] = [schema, opts, !isSchema(model) && model];
    Reflect.defineMetadata(paramMetadataKey, schemas, target, propertyKey);
  };
}
