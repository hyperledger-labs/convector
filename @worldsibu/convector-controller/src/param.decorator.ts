import { Schema, object } from 'yup';
import 'reflect-metadata';

const isSchema = (schema: any): schema is Schema<any> => 'validate' in schema;

export const paramMetadataKey = Symbol('param');

export function Param<T>(
  model: Schema<T>|{ new(...args: any[]): T },
  opts: any = { context: {} }
) {
  return (target: any, propertyKey: string, parameterIndex: number) => {

    const schemas: [Schema<any>, any, { new(...args: any[]): T }] =
      Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];

    const schema = isSchema(model) ? model : object<T>()
      .transform(value => value instanceof model ? value : new model(value));

    schemas[parameterIndex] = [schema, opts, !isSchema(model) && model];
    Reflect.defineMetadata(paramMetadataKey, schemas, target, propertyKey);
  };
}
