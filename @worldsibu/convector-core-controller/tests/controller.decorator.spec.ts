// tslint:disable:no-unused-expression

import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';

import { Controller, controllerMetadataKey } from '../src/controller.decorator';

describe('Controller Decorator', () => {
  @Controller('Test')
  class TestController { }

  it('should return the controller namespace', () => {
    expect(Reflect.getMetadata(controllerMetadataKey, TestController)).to.eq('Test');
  });
});
