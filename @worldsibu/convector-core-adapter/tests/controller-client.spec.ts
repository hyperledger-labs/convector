// tslint:disable:no-unused-expression

import * as yup from 'yup';
import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';
import {
  ConvectorController,
  Controller,
  Invokable
} from '@worldsibu/convector-core-controller';

import { ClientFactory } from '../src/controller-client';
import { ControllerAdapter } from '../src/controller-adapter';

@Controller('test')
class TestController extends ConvectorController {
  @Invokable()
  public async test() {
    return 'works';
  }
}

class TestAdapter implements ControllerAdapter {
  private ctrl: ConvectorController;

  constructor(ctrl: new () => ConvectorController) {
    this.ctrl = new ctrl();
  }

  async invoke(controller, name, config, ...args) {
    if (config.casa) {
      return 'from-adapter';
    }

    return {
      result: this.ctrl[name]({}, args, {})
    };
  }

  async query(controller, name, config, ...args) {
    return {
      result: this.ctrl[name]({}, args, {})
    };
  }
}

describe('Controller Client', () => {
  it('it should generate a client with an adapter', async () => {
    const adapter = new TestAdapter(TestController);
    const testCtrl = ClientFactory(TestController, adapter);

    expect(await testCtrl.test()).to.eq('works');
  });

  it('it should be able to query the controllers', async () => {
    const adapter = new TestAdapter(TestController);
    const testCtrl = ClientFactory(TestController, adapter);

    expect(await testCtrl.$query().test()).to.eq('works');
  });

  it('it should pass the config to the adapter', async () => {
    const adapter = new TestAdapter(TestController);
    const testCtrl = ClientFactory(TestController, adapter);

    expect(await testCtrl.$config({ casa: true }).test()).to.eq('from-adapter');
  });

  it('it should make a raw call, retuning all the response data', async () => {
    const adapter = new TestAdapter(TestController);
    const testCtrl = ClientFactory(TestController, adapter);

    const response: any = await testCtrl.$raw().test();
    expect(response).to.haveOwnProperty('result');
  });

  it.only('it should pass config to adapter and query the controllers', async () => {
    const adapter = new TestAdapter(TestController);
    const testCtrl = ClientFactory(TestController, adapter);
    const mockData = {car: 'Range Rover Vogue', color: "Silicon Silver"}

    const newCtrl = testCtrl.$config(mockData).$query();

    expect(newCtrl.config, 'config params passed correctly').to.eq(mockData);
    expect(newCtrl.query, 'query property passed correctly').to.true;
  });
});
