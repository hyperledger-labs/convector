import { Stub } from 'fabric-shim';
import { InvalidIdError } from '@worldsibu/chaincode-errors';
import { StubHelper } from '@theledger/fabric-chaincode-utils';
import { BaseStorage } from '@worldsibu/chaincode-base-storage';

export class StubStorage extends BaseStorage {
  private stubHelper: StubHelper;

  constructor(stub: Stub) {
    super();

    this.stubHelper = new StubHelper(stub);
  }

  public async get(id: string): Promise<any> {
    InvalidIdError.test(id);
    return await this.stubHelper.getStateAsObject(id);
  }

  public async set(id: string, content: any) {
    InvalidIdError.test(id);
    return await this.stubHelper.putState(id, JSON.stringify(content));
  }

  public async delete(id: string) {
    InvalidIdError.test(id);
    return await this.stubHelper.getStub().deleteState(id);
  }
}
