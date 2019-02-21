/** @module convector-core-controller */

/** Base controller class. All controllers must inherit it */
export abstract class ConvectorController<T=any> {
  /**
   * Sender's public certificate fingerprint.
   * This can be used to identify the user invoking the controller functions
   */
  protected sender: string;

  /**
   * Transaction details. Depends on the platform running, when using core-chaincode
   * this will be a @worldsibu/convector-core-chaincode#ChaincodeTx
   */
  protected tx: T;
}
