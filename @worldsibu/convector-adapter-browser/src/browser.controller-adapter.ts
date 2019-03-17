/** @module @worldsibu/convector-adapter-browser */

import { ControllerAdapter, ConvectorController, getInvokables } from '@worldsibu/convector-core';

export class BrowserControllerAdapter implements ControllerAdapter {
  private user: string;
  private controllers = new Map<string, ConvectorController>();

  public async init(
    controllers: (new (...args: any[]) => ConvectorController)[],
    defaultUser = 'BROWSER'
  ) {
    this.user = defaultUser;

    controllers
      .map(C => {
        const { namespace } = getInvokables(C);
        this.controllers.set(namespace, new C());
      });
  }

  public async invoke(
    controller: string,
    name: string,
    config: any = {},
    ...args: any[]
  ) {
    const ctrl = this.controllers.get(controller);
    return ctrl[name].call(
      { [controller]: ctrl },
      {},
      args.map(a => typeof a === 'string' ? a : JSON.stringify(a)),
      { sender: { value: config.user || this.user } }
    );
  }
}
