// tslint:disable:no-unused-expression

import * as uuid from 'uuid/v1';
import { expect } from 'chai';
import { Chaincode } from '@theledger/fabric-chaincode-utils';
import { ChaincodeMockStub } from '@theledger/fabric-mock-stub';
import 'mocha';

import { StubStorage } from '../src/stub-storage';

class TestCC extends Chaincode { }

describe('STUB Storage', () => {
  let storage: StubStorage;
  let stub: ChaincodeMockStub;

  beforeEach(() => {
    stub = new ChaincodeMockStub('Test', new TestCC());
    storage = new StubStorage(stub);
  });

  it('it should persist and retrieve data', async () => {
    const txId = uuid();
    stub.mockTransactionStart(txId);
    await storage.set('test', { name: 'test' });
    stub.mockTransactionEnd(txId);
    const result = await storage.get('test');
    expect(result).to.include({ name: 'test' });
  });

  it('it should delete data', async () => {
    const txId = uuid();
    stub.mockTransactionStart(txId);
    await storage.set('test', { name: 'test' });
    await storage.delete('test');
    stub.mockTransactionEnd(txId);
    const result = await storage.get('test');
    expect(result).to.null;
  });

  it('it should run queries', async () => {
    const txId = uuid();
    stub.mockTransactionStart(txId);
    await storage.set('test1', { id: 1, type: 'test' });
    await storage.set('test2', { id: 2, type: 'test' });
    await storage.set('test3', { id: 3, type: 'test' });
    stub.mockTransactionEnd(txId);

    const result = await storage.query({ selector: { type: 'test' } });
    expect(result.length).to.eq(3);
  });

  it('should return the history of a key', async () => {
    const key = 'test';
    const txId = uuid();
    stub.mockTransactionStart(txId);
    await storage.set(key, '1');
    await storage.set(key, '2');
    await storage.set(key, '3');
    stub.mockTransactionEnd(txId);

    const history = await storage.history(key);
    expect(history).length(3);
  });
});
