export interface ControllerAdapter {
  invoke(controller: string, name: string, ...args: any[]): Promise<any>;
}
