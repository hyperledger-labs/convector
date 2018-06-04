// tslint:disable:no-unused-expression

import * as yup from 'yup';
import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';

import { Param, paramMetadataKey } from '../src/param.decorator';

describe('Param Decorator', () => {
  class TestModel {
    public name: string;

    constructor(content) {
      this.name = content.name;
    }
  }

  class TestController {
    test(
      @Param(yup.number())
      param1: number,
      @Param(TestModel)
      param2: TestModel
    ) {
      // empty block
    }
  }

  it('should register all the parameters', () => {
    const schemas = Reflect.getMetadata(paramMetadataKey, new TestController(), 'test');

    expect(schemas.length).to.eq(2);
  });

  it('should convert a model into a schema correctly', () => {
    const schemas = Reflect.getMetadata(paramMetadataKey, new TestController(), 'test');
    const testModel = schemas[1][0].validateSync({ name: 'test' }) as TestModel;

    // TestModel schema
    expect(testModel).to.eql({ name: 'test' });
  });
});
