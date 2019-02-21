import { ClientIdentity } from 'fabric-shim';
import { StubHelper } from '@theledger/fabric-chaincode-utils';

export abstract class ChaincodeTx {
  stub: StubHelper;
  identity: ClientIdentity;
}
