import { RPC } from "@uimix/typed-rpc";
import { ComponentInfo, TargetInfo } from "../data";
import { IPluginToUIRPC, IUIToPluginRPC } from "../rpc";

class RPCHandler implements IPluginToUIRPC {
  render(
    component: ComponentInfo,
    props: Record<string, any>,
    width?: number | undefined,
    height?: number | undefined
  ): Promise<{ png: ArrayBuffer; width: number; height: number }> {
    throw new Error("Method not implemented.");
  }
  onTargetChange(target: TargetInfo | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export const rpc = new RPC<IPluginToUIRPC, IUIToPluginRPC>(
  (data) => parent.postMessage({ pluginMessage: data }, "*"),
  (handler) => {
    const onMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage) {
        handler(event.data.pluginMessage);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  },
  new RPCHandler()
);
