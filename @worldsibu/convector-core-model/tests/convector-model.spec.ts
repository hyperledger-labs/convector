// tslint:disable:no-unused-expression

import * as yup from 'yup';
import { expect } from 'chai';
import { BaseStorage } from '@worldsibu/convector-core-storage';
import 'mocha';
import 'reflect-metadata';

import { Validate } from '../src/validate.decorator';
import { ConvectorModel } from '../src/convector-model';

class TestStorage extends BaseStorage {
  private storage = new Map();

  public async query(query: any): Promise<any[]> {
    return Array
      .from(this.storage.entries())
      // { selector: { type } } is the only query we support for the test storage
      .filter(([k, v]) => v.type === query.selector.type);
  }

  public async get(id: string): Promise<any> {
    return this.storage.get(id);
  }

  public async set(id: string, content: any) {
    this.storage.set(id, content);
  }

  public async delete(id: string) {
    this.storage.delete(id);
  }
}

class TestModel extends ConvectorModel<TestModel> {
  public type = 'io.worldsibu.test';

  @Validate(yup.string())
  public name: string;
}

describe('Convector Model', () => {
  let storage;

  beforeEach(() => {
    storage = new TestStorage();
    BaseStorage.current = storage;
  });

  it('should be able to create a new instance based on the constructor initiator',
    () => {
      const test = new TestModel({ id: 'test', name: 'test' });

      expect(test.id).to.eq('test');
      expect(test.name).to.eq('test');
      expect(test.type).to.eq('io.worldsibu.test');
    }
  );

  it('should discard any other additional properties', () => {
    const test = new TestModel({ id: 'test', test: 'invalid' } as any);

    expect(test.id).to.eq('test');
    expect((test as any).test).to.undefined;
  });

  it('should store the models', async () => {
    const test = new TestModel({ id: 'test', name: 'test' });
    await test.save();

    const inMemory = await storage.get('test');

    expect(inMemory.id).to.eq('test');
    expect(inMemory.name).to.eq('test');
    expect(inMemory.type).to.eq('io.worldsibu.test');
  });

  it('should read a model from memory', async () => {
    const original = new TestModel({ id: 'test', name: 'test' });
    await original.save();

    const test = new TestModel('test');
    await test.fetch();

    expect(test.id).to.eq('test');
    expect(test.name).to.eq('test');
    expect(test.type).to.eq('io.worldsibu.test');
  });

  it('should update a model from memory', async () => {
    const original = new TestModel({ id: 'test', name: 'test' });
    await original.save();
    original.update({ name: 'updated' });

    const test = new TestModel('test');
    await test.fetch();

    expect(test.id).to.eq('test');
    expect(test.name).to.eq('updated');
    expect(test.type).to.eq('io.worldsibu.test');
  });

  it('should dump only the public properties', () => {
    const original = new TestModel({ id: 'test', name: 'test' });
    const test = original.toJSON();

    expect(test).to.deep.include({
      id: 'test',
      name: 'test',
      type: 'io.worldsibu.test'
    });
  });

  it('should delete existing model', async () => {
    const original = new TestModel({ id: 'test', name: 'test' });
    await original.save();
    original.delete();

    const test = await storage.get('test');
    expect(test).to.undefined;
  });

  it('should convert the ID to string', async () => {
    const test = new TestModel({ id: 1234, name: 'test' } as any);
    expect(typeof test.id).to.eq('string');
  });

  it('should return a model found in DB', async () => {
    const test = new TestModel({ id: 'test', name: 'test' });
    await test.save();

    const result = await TestModel.getOne('test');
    expect(result).to.include({ name: 'test' });
  });

  it('should return a all the models in DB', async () => {
    await new TestModel({ id: 'test1', name: '1' }).save();
    await new TestModel({ id: 'test2', name: '2' }).save();
    await new TestModel({ id: 'test3', name: '3' }).save();

    const results = await TestModel.getAll();
    expect(results.length).to.eq(3);
  });
});
