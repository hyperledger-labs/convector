// tslint:disable:no-unused-expression

import * as yup from 'yup';
import { expect } from 'chai';
import { ChaincodeMockStub } from '@theledger/fabric-mock-stub';
import { Chaincode, StubHelper } from '@theledger/fabric-chaincode-utils';
import 'mocha';
import 'reflect-metadata';

import { Param } from '../src/param.decorator';
import { Controller } from '../src/controller.decorator';
import { Invokable, getInvokables } from '../src/invokable.decorator';

describe('Invokable Decorator', () => {
  class TestCC extends Chaincode { }

  class TestModel {
    public name: string;

    constructor(content) {
      this.name = content.name;
    }
  }

  @Controller('test')
  class Test {
    @Invokable()
    public async plain(
      @Param(yup.string())
      name: string
    ) {
      return name;
    }

    @Invokable()
    public async complex(
      @Param(TestModel)
      model: TestModel
    ) {
      return model;
    }
  }

  let test: Test;

  beforeEach(() => test = new Test());

  it('should create a map of the invokable functions', () => {
    const invokables = getInvokables(Test);
    expect(invokables.test_plain).to.exist;
  });

  it('should translate a chaincode call into a controller call', async () => {
    const stub = new ChaincodeMockStub('test-cc', new TestCC());
    const result = await (test.plain as any)(new StubHelper(stub), ['test']);
    expect(result).to.eq('test');
  });

  it('should instantiate models from args', async () => {
    const stub = new ChaincodeMockStub('test-cc', new TestCC());
    const result = await (test.complex as any)(new StubHelper(stub), [JSON.stringify({ name: 'test' })]);

    expect(result).to.be.instanceof(TestModel);
    expect(result.name).to.eq('test');
  });
});
