import { Schema, object } from 'yup';
import { ClientIdentity } from 'fabric-shim';
import { StubHelper } from '@theledger/fabric-chaincode-utils';

/** @hidden */
const isSchema = (schema: any): schema is Schema<any> => 'validate' in schema;

export class ChaincodeTx {
  constructor(public stub: StubHelper, public identity: ClientIdentity) { }

  public getTransientValue<T>(name: string, validator: Schema<T>|{ new (...args): T}): Promise<T> {
    const schema = isSchema(validator) ? validator : object()
      .transform(value => value instanceof validator ? value : new validator(value));

    const transient = this.stub.getStub().getTransient();
    const transientValue = transient.get(name).toString('utf8');
    return schema.validate(transientValue) as Promise<T>;
  }
}
