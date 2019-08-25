import { expect } from 'chai';
import 'mocha';

import { MockControllerAdapter } from '../src';

describe('Mock Controller Adapter', () => {
  it('should generate certificates', async () => {
    const adapter = new MockControllerAdapter();

    adapter.addUser({countryName: 'Costa Rica', localityName: 'San Jose', commonName: 'Diego'});
    console.log(adapter.users['Diego']);
    expect(adapter.users['Diego']).to.exist;
  });
});
