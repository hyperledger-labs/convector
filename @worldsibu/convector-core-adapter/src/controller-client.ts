import { ConvectorController, getInvokables } from '@worldsibu/convector-core-controller';

import { ControllerAdapter } from './controller-adapter';

export interface IConvectorControllerClient<T extends ConvectorController> {
  config: any;
  query: boolean;
  user: string|true;
  ctrl: new (content?: any) => T;
  adapter: ControllerAdapter;
}

export const controllerClientMethods = {
  $withUser<T extends ConvectorController>(this: IConvectorControllerClient<T>, user: string|true) {
    const newClient = ClientFactory(this.ctrl, this.adapter);
    newClient.user = user;
    return newClient;
  },
  $query<T extends ConvectorController>(this: IConvectorControllerClient<T>) {
    const newClient = ClientFactory(this.ctrl, this.adapter);
    newClient.query = true;
    return newClient;
  },
  $config<T extends ConvectorController>(this: IConvectorControllerClient<T>, config: any) {
    const newClient = ClientFactory(this.ctrl, this.adapter);
    newClient.config = config;
    return newClient;
  }
};

export type ConvectorControllerClient<T extends ConvectorController> =
  typeof controllerClientMethods&IConvectorControllerClient<T>&T;

export function ClientFactory<T extends ConvectorController>(
  ctrl: new (content?: any) => T,
  adapter: ControllerAdapter
): ConvectorControllerClient<T> {
  const client: ConvectorControllerClient<T> = new ctrl() as any;
  Object.assign(client, { ctrl, adapter, query: false }, controllerClientMethods);

  const { namespace, invokables } = getInvokables(ctrl);

  for (let fn in invokables) {
    client[fn] = function ControllerClientWrapper(this: IConvectorControllerClient<T>, ...args) {
      const config = { ...this.config, user: this.user };

      if (this.query && adapter.query) {
        return adapter.query(namespace, fn, config, ...args);
      }

      return adapter.invoke(namespace, fn, config, ...args);
    };
  }

  return client;
}
