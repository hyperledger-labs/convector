// tslint:disable:no-unused-expression

import { expect } from 'chai';
import * as localStorage from 'localStorage';
import 'mocha';

global['localStorage'] = localStorage;

import { LocalstorageStorage } from '../src/locastorage-storage';

describe('Localstorage Storage', () => {
  let storage: LocalstorageStorage;

  beforeEach(() => {
    storage = new LocalstorageStorage();
  });

  it('it should persist and retrieve data', async () => {
    await storage.set('test', { name: 'test' });
    const result = await storage.get('test');
    expect(result).to.include({ name: 'test' });
  });

  it('it should delete data', async () => {
    await storage.set('test', { name: 'test' });
    await storage.delete('test');
    const result = await storage.get('test');
    expect(result).to.null;
  });

  it('it should run queries', async () => {
    await storage.set('test1', { id: 1, type: 'test' });
    await storage.set('test2', { id: 2, type: 'test' });
    await storage.set('test3', { id: 3, type: 'test' });

    const result = await storage.query({ selector: { type: 'test' } });
    expect(result.length).to.eq(3);
  });
});
