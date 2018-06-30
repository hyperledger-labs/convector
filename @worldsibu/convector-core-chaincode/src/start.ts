/** @module convector-core-chaincode */

import * as shim from 'fabric-shim';

import { Chaincode } from './chaincode';

shim.start(new Chaincode());
