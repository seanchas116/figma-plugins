import { InstanceInfo, Assets } from "../data";
import { IUIToPluginRPC } from "../rpc";

class RPCHandler implements IUIToPluginRPC {
  ready(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateInstance(instance?: InstanceInfo | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }
  syncAssets(assets: Assets): Promise<void> {
    throw new Error("Method not implemented.");
  }
  resize(width: number, height: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
