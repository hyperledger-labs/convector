// tslint:disable:no-unused-expression

import * as yup from 'yup';
import { expect } from 'chai';
import { ClientIdentity } from 'fabric-shim';
import { ChaincodeMockStub } from '@theledger/fabric-mock-stub';
import { Chaincode, StubHelper } from '@theledger/fabric-chaincode-utils';
import 'mocha';
import 'reflect-metadata';

import { Validate } from '@worldsibu/convector-core-model';

import { Param } from '../src/param.decorator';
import { Controller } from '../src/controller.decorator';
import { ConvectorController } from '../src/convector-controller';
import { Invokable, getInvokables } from '../src/invokable.decorator';
import { OptionalParam } from '../src/optional.decorator';

class TestCC extends Chaincode {
  constructor(ctr: any) {
    super();
    const { namespace, invokables } = getInvokables(ctr);
    Object.assign(this, { [namespace]: new ctr() }, invokables);
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
class Test extends ConvectorController {
  @Invokable()
  public async me() {
    return this.sender;
  }

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

  @Invokable()
  public async internalCall(
    @Param(yup.string())
    name: string
  ) {
    return this.plain(name);
  }

  @Invokable()
  public async optionalParam(
    @Param(yup.string())
    name: string,
    @OptionalParam()
    @Param(yup.string())
    sufix: string = 'test'
  ) {
    return `${name} ${sufix}`;
  }
}

describe('Invokable Decorator', () => {
  let test: Test;
  let testCC: TestCC;
  let stub: ChaincodeMockStub;

  function getExtras() {
    const s = new StubHelper(stub);
    const identity = new ClientIdentity(stub);
    const fingerprint = identity.getX509Certificate().fingerPrint;

    return {
      sender: {
        value: fingerprint
      },
      tx: {
        value: {
          identity,
          stub: s
        }
      }
    };
  }

  beforeEach(() => {
    testCC = new TestCC(Test);
    stub = new ChaincodeMockStub('test-cc', testCC);
    test = testCC['test'];
  });

  it('should create a map of the invokable functions', () => {
    const { invokables } = getInvokables(Test);
    expect(invokables.plain).to.exist;
  });

  it('should initialize and return the `this.sender`', async () => {
    const result = await test.me
      .call(testCC, new StubHelper(stub), [], getExtras());
    console.log('should initialize and return the `this.sender`');
    console.log(result);
    expect(result).to.not.eq('');
  });

  it('should translate a chaincode call into a controller call', async () => {
    const result = await test.plain
      .call(testCC, new StubHelper(stub), ['test'], getExtras());
    expect(result).to.eq('test');
  });

  it('should allow internal calls to be made in the methods', async () => {
    const result = await test.internalCall
      .call(testCC, new StubHelper(stub), ['test'], getExtras());
    expect(result).to.eq('test');
  });

  it('should instantiate models from args', async () => {
    const result = await test.complex
      .call(testCC, new StubHelper(stub), [JSON.stringify({ name: 'test' })], getExtras());

    expect(result).to.be.instanceof(TestModel);
    expect(result.name).to.eq('test');
  });

  it('should succeed accepting an incomplete model as a param if it is for update the content', async () => {
    const result = await test.update
      .call(testCC, new StubHelper(stub), [JSON.stringify({})], getExtras());

    expect(result).to.be.instanceof(TestModel);
  });

  it('should allow invokes with optional params', async () => {
    const result = await test.optionalParam
      .call(testCC, new StubHelper(stub), ['test'], getExtras());
    expect(result).to.eq('test test');
  });

  it('should reject if less parameters are passed', async () => {
    await test.optionalParam.call(testCC, new StubHelper(stub), [], getExtras())
      .then(() => expect.fail('It should have failed'), () => console.log('Expected error'));
  });
});
