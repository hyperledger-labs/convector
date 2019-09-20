// tslint:disable:no-unused-expression

import * as yup from 'yup';
import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';

import { Param, paramMetadataKey } from '../src/param.decorator';
import { OptionalParam, optionalMetadataKey } from '../src/optional.decorator';

describe('OptionalParam Decorator', () => {
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
      @OptionalParam()
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

  it('should recognize the optional params', () => {
    const optionals = Reflect.getMetadata(optionalMetadataKey, new TestController(), 'test');

    // TestModel schema
    expect(optionals[0]).to.eq(1);
  });
});
