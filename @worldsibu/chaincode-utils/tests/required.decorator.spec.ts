// tslint:disable:no-unused-expression

import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';

import { Required, ensureRequired } from '../src/required.decorator';

describe('Required Decorator', () => {
  class Test {
    @Required()
    name: string;
  }

  let test: Test;

  beforeEach(() => test = new Test());

  it('should check for all required props', () => {
    test.name = 'test';
    expect(ensureRequired(test)).to.true;
  });

  it('should check for all required props missing', () => {
    expect(ensureRequired(test)).to.false;
  });
});
