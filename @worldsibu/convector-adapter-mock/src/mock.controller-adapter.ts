/** @module @worldsibu/convector-adapter-mock */

import * as uuid from 'uuid/v1';
import * as selfsigned from 'selfsigned';
import { Chaincode, IConfig } from '@worldsibu/convector-core-chaincode';
import { ChaincodeMockStub, Transform } from '@theledger/fabric-mock-stub';
import { ControllerAdapter, ClientResponseError } from '@worldsibu/convector-core';

// Remove when this gets merged
// https://github.com/wearetheledger/fabric-node-chaincode-utils/pull/23
import { Transform as _Transform } from '@theledger/fabric-chaincode-utils';
_Transform.isObject = data => data !== null && typeof data === 'object';

export interface CertificateProps {
  commonName: string;
  countryName?: string;
  localityName?: string;
  stateOrProvinceName?: string;
  organizationName?: string;
  organizationalUnitName?: string;
  emailAddress?: string;
}

export class MockControllerAdapter implements ControllerAdapter {
  public users = {};

  public stub = new ChaincodeMockStub('Participant', new Chaincode());

  public async init(config: IConfig[]) {
    await this.stub.mockInit(uuid(), []);
    await this.stub.mockInvoke(uuid(), ['initControllers', JSON.stringify(config)]);
  }

  public async getById<T>(id: string): Promise<T> {
    const response = await this.stub.getState(id);
    return Transform.bufferToObject(response) as any;
  }

  public async invoke(controller: string, name: string, config: any = {}, ...args: any[]) {
    this.stub['usercert'] = config.user ? this.users[config.user] || config.user : this.stub['usercert'];

    const transientMap = Object.keys(config.transient || {}).reduce((map, k) => {
      const v = config.transient[k];
      map.set(k, Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)));
      return map;
    }, new Map<string, Buffer>());

    const response = await this.stub.mockInvoke(uuid(), [
      `${controller}_${name}`,
      ...args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString())
    ], transientMap);

    if (response.status === 500) {
      let err: any = response.message.toString();

      try {
        err = JSON.parse(JSON.parse(err));
      } catch (e) {
        try {
          err = JSON.parse(err);
        } catch (e) {
          // empty
        }
      }

      throw new ClientResponseError([{
        error: err,
        response
      }]);
    }

    return {
      ...response,
      result: Transform.bufferToObject(response.payload),
    };
  }

  addUser(name: string);
  addUser(props: CertificateProps);
  addUser(props: string|CertificateProps) {
    let name: string;

    if (typeof props === 'string') {
      name = props;
      props = {commonName: props};
    } else {
      name = props.commonName;
    }

    const attrsFormatted = Object.keys(props).map(k => ({ name: k, value: props[k] }));
    const pems = selfsigned.generate(attrsFormatted);
    this.users[name] = pems.cert;
  }
}
