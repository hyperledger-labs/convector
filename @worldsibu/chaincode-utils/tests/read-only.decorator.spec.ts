// tslint:disable:no-unused-expression

import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';

import { ReadOnly } from '../src/read-only.decorator';

describe('Required Decorator', () => {
  class Test {
    @ReadOnly()
    name: string;

    @ReadOnly()
    age = 5;
  }

  let test: Test;

  beforeEach(() => test = new Test());

  it('should allow assign a read only prop the first time', () => {
    test.name = 'test';
    expect(test.name).to.eq('test');
  });

  it('should skip assigning a read only prop if already assigned', () => {
    test.age = 6;
    expect(test.age).to.eq(5);
  });
});
