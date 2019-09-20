/** @module convector-core-controller */

import * as g from 'window-or-global';
import { Schema, object } from 'yup';
import 'reflect-metadata';

/** @hidden */
const isSchema = (schema: any): schema is Schema<any> => 'validate' in schema;

/** @hidden */
export const optionalMetadataKey = g.ConvectorOptionalParamMetadataKey || Symbol('optional-param');
g.ConvectorOptionalParamMetadataKey = optionalMetadataKey;

/**
 * Used to flag the parameters as optional
 *
 * @decorator
 */
export function Optional<T>() {
  return (target: any, propertyKey: string, parameterIndex: number) => {

    const optionals: number[] =
      Reflect.getOwnMetadata(optionalMetadataKey, target, propertyKey) || [];

    optionals.push(parameterIndex);
    Reflect.defineMetadata(optionalMetadataKey, optionals, target, propertyKey);
  };
}
