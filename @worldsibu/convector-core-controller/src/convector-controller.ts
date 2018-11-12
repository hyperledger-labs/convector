/** @module convector-core-controller */

/** Base controller class. All controllers must inherit it */
export abstract class ConvectorController {
  /**
   * Sender's public certificate fingerprint.
   * This can be used to identify the user invoking the controller functions
   */
  protected sender: string;
}
