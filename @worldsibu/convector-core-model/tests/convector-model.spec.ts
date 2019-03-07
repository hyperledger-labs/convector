// tslint:disable:no-unused-expression

import * as yup from 'yup';
import { expect } from 'chai';
import { BaseStorage } from '@worldsibu/convector-core-storage';
import 'mocha';
import 'reflect-metadata';

import { Validate } from '../src/validate.decorator';
import { ConvectorModel, FlatConvectorModel } from '../src/convector-model';

class TestStorage extends BaseStorage {
  private storage = new Map();
  private _history = new Map();

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
    this._history.set(id, (this._history.get(id) || []).concat({
      value: JSON.parse(JSON.stringify(content)),
      tx_id: undefined,
      timestamp: Date.now
    }));
  }

  public async delete(id: string) {
    this.storage.delete(id);
    this._history.set(id, (this._history.get(id) || []).push({
      value: undefined,
      tx_id: undefined,
      timestamp: Date.now
    }));
  }

  public async history(id: string) {
    return this._history.get(id);
  }
}

class TestModel extends ConvectorModel<TestModel> {
  public type = 'io.worldsibu.test';

  @Validate(yup.string())
  public name: string;

  @Validate(yup.number())
  public optionalProperty?: number;
}

class TestFlatModel extends ConvectorModel<TestFlatModel> {
  public type = 'io.worldsibu.test2';

  @Validate(TestModel)
  public child: FlatConvectorModel<TestModel>;

}

class TestNestModel extends ConvectorModel<TestNestModel> {
  public type = 'io.worldsibu.test.nest';

  @Validate(TestModel)
  public test: FlatConvectorModel<TestModel>;
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

  it('should dump the nested properties', () => {
    const test = new TestModel({ name: 'test' });
    const original = new TestNestModel({ id: 'test-nest', test });
    const dump = original.toJSON();

    expect(dump).to.deep.include({
      id: 'test-nest',
      type: 'io.worldsibu.test.nest',
      test: {
        name: 'test',
        type: 'io.worldsibu.test',
      }
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

  it('should return an empty model when not found in DB', async () => {
    const result = await TestModel.getOne('invalid-id');
    expect(result.id).to.undefined;
  });

  it('should extract the model schema', () => {
    const schema = TestModel.schema();
    const flatModel = schema.validateSync({
      id: 'test',
      name: '1',
      extra: true
    } as any, { stripUnknown: true });

    expect(flatModel).to.include({ id: 'test', name: '1' });
    expect(flatModel).not.to.include({ extra: true });
  });

  it('should extract the history', async () => {
    const model = new TestModel({ id: 'history', name: '1' });
    await model.save();

    model.name = '2';
    await model.save();

    model.name = '3';
    await model.save();

    const history = await model.history();
    expect(history).length(3);
    expect(history[0].value.name).to.eq('1');
    expect(history[1].value.name).to.eq('2');
    expect(history[2].value.name).to.eq('3');
  });
});

describe('FlatConvectorModel', ()=>{
  it('Should ignore optional property', ()=>{
    var item = new TestModel();
    var parent = new TestFlatModel();
    parent.child = item;
    expect(parent.child.optionalProperty).to.undefined;
  });

  it('Should set optional property', ()=>{
    var item = new TestModel();
    var parent = new TestFlatModel();
    parent.child = item;
    item.optionalProperty = 12345;
    expect(parent.child.optionalProperty).to.equal(12345);
  });

});
