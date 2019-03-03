import { ConvectorController, getInvokables } from '@worldsibu/convector-core-controller';

import { ControllerAdapter } from './controller-adapter';

export interface IConvectorControllerClient {
  user: string|true;
}

export const controllerClientMethods = {
  $withUser(this: IConvectorControllerClient, user: string|true) {
    this.user = user;
    return this;
  }
};

export type ConvectorControllerClient<T> = typeof controllerClientMethods&T;

export function ClientFactory<T extends ConvectorController>(
  ctrl: new (content?: any) => T,
  adapter: ControllerAdapter
): ConvectorControllerClient<T> {
  const client: ConvectorControllerClient<T> = new ctrl() as any;
  Object.assign(client, controllerClientMethods);

  const { namespace, invokables } = getInvokables(ctrl);

  for (let fn in invokables) {
    client[fn] = function ControllerClientWrapper(this: IConvectorControllerClient, ...args) {
      return adapter.invoke(namespace, fn, this.user, ...args);
    };
  }

  return client;
}
