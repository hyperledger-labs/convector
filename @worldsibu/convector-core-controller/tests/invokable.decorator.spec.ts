// tslint:disable:no-unused-expression

import * as yup from 'yup';
import { expect } from 'chai';
import { Validate } from '@worldsibu/convector-core-model';
import { ChaincodeMockStub } from '@theledger/fabric-mock-stub';
import { Chaincode, StubHelper } from '@theledger/fabric-chaincode-utils';
import 'mocha';
import 'reflect-metadata';

import { Param } from '../src/param.decorator';
import { Controller } from '../src/controller.decorator';
import { Invokable, getInvokables } from '../src/invokable.decorator';

describe('Invokable Decorator', () => {
  class TestCC extends Chaincode {
    constructor(ctr: any) {
      super();

      Object.assign(this, getInvokables(ctr));
    }
  }

  class TestModel {
    @Validate(yup.string())
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

    @Invokable()
    public async update(
      @Param(TestModel, { update: true })
      model: TestModel
    ) {
      return model;
    }
  }

  let test: Test;
  let testCC: TestCC;
  let stub: ChaincodeMockStub;

  beforeEach(() => {
    testCC = new TestCC(Test);
    stub = new ChaincodeMockStub('test-cc', testCC);
    test = testCC['test'];
  });

  it('should create a map of the invokable functions', () => {
    const invokables = getInvokables(Test);
    expect(invokables.test_plain).to.exist;
    expect(invokables.test).to.exist;
  });

  it('should translate a chaincode call into a controller call', async () => {

    const result = await test.plain.call(testCC, new StubHelper(stub), ['test']);
    expect(result).to.eq('test');
  });

  it('should instantiate models from args', async () => {
    const result = await test.complex.call(testCC, new StubHelper(stub), [JSON.stringify({ name: 'test' })]);

    expect(result).to.be.instanceof(TestModel);
    expect(result.name).to.eq('test');
  });

  it('should succeed accepting an incomplete model as a param if it is for update the content', async () => {
    const result = await test.update.call(testCC, new StubHelper(stub), [JSON.stringify({})]);

    expect(result).to.be.instanceof(TestModel);
  });
});
