// tslint:disable:no-unused-expression

import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';

import { Default, getDefaults } from '../src/default.decorator';

describe('Default Decorator', () => {
  class Test {
    @Default('test')
    name: string;

    @Default(() => 5)
    age: number;
  }

  let test: Test;

  beforeEach(() => test = new Test());

  it('should return the default values', () => {
    const defaults = getDefaults(test);
    expect(defaults).to.eql({ name: 'test', age: 5 });
  });
});
