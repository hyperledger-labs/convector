import { StubStorage } from '@worldsibu/convector-storage-stub';
import { ChaincodeTx } from '@worldsibu/convector-core-chaincode';
import { ControllerAdapter, BaseStorage } from '@worldsibu/convector-core';

export interface InChaincodeAdapterConfig {
  tx?: ChaincodeTx;
  chaincode?: string;
  channel?: string;
}

export class InChaincodeAdapter implements ControllerAdapter {

  public async invoke(controller: string, name: string, config: InChaincodeAdapterConfig = {}, ...args: any[]) {
    return this.rawInvoke(`${controller}_${name}`, config, ...args);
  }

  public async rawInvoke(fn: string, config: InChaincodeAdapterConfig = {}, ...args: any[]) {
    if (!config.tx) {
      throw new Error('InChaincodeAdapter needs the ChaincodeTx in config');
    }

    if (!config.chaincode) {
      throw new Error('InChaincodeAdapter needs a stub in config');
    }

    const stub = config.tx.stub.getStub();
    const res = await stub.invokeChaincode(config.chaincode, [fn, ...args], config.channel);
    const storage = BaseStorage.current as StubStorage;

    // Make sure the stub is still the same
    // On unit tests it might change the context for the subsecuent calls
    storage.stubHelper = config.tx.stub;

    return JSON.parse(res.payload.toString('utf8'));
  }
}
