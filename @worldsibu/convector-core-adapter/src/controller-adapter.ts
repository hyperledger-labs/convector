/** @module convector-core-adapter */

/**
 * The controller adapter in the modular design is the one who puts
 * the controller in communication with its current environment.
 *
 * This is used in conjunction with the **generate-interface** command
 * to generate client versions of the controllers, the ones that talk with the adapter
 * and the adapter talks with the layer available in its current environment.
 */
export interface ControllerAdapter {

  /**
   * This method is the only requirement to be an adapter.
   * This is going to be called whenever a controller needs to invoke the chaincode
   *
   * @param controller The controller namespace
   * @param name The function name
   * @param config Extra paramters to the custom adapter
   * @param args The arguments for the function
   */
  invoke(controller: string, name: string, config?: any, ...args: any[]): Promise<any>;

  /**
   * This is going to be called whenever a controller needs to query the chaincode
   *
   * @param controller The controller namespace
   * @param name The function name
   * @param config Extra paramters to the custom adapter
   * @param args The arguments for the function
   */
  query?(controller: string, name: string, config?: any, ...args: any[]): Promise<any>;
}
