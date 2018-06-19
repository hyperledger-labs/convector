// tslint:disable:no-unused-expression

import * as yup from 'yup';
import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';

import { Validate } from '../src/validate.decorator';

describe('Validate Decorator', () => {
  class Test {
    @Validate(yup.string().strict(true))
    name = 'test';
  }

  let test: Test;

  beforeEach(() => test = new Test());

  it('should have the initial value', () => {
    expect(test.name).to.eq('test');
  });

  it('should validate and keep valid values', () => {
    test.name = 'test2';
    expect(test.name).to.eq('test2');
  });

  it('should not keep invalid values', () => {
    try {
      test.name = {} as any;
    } catch (e) {
      // empty block
    }

    expect(test.name).to.eq('test');
  });
});
