import { RPC } from "@uimix/typed-rpc";
import { ComponentInfo, TargetInfo } from "../data";
import { IPluginToUIRPC, IUIToPluginRPC } from "../rpc";
import { state } from "./state/State";

export const rpcHandler: IPluginToUIRPC = {
  render: async (
    component: ComponentInfo,
    props: Record<string, any>,
    width?: number | undefined,
    height?: number | undefined
  ): Promise<{ png: ArrayBuffer; width: number; height: number }> => {
    throw new Error("Function not implemented.");
  },
  onTargetChange: async (target: TargetInfo | undefined) => {
    state.$target.value = target;
  },
};

export const rpc = new RPC<IPluginToUIRPC, IUIToPluginRPC>({
  post: (data) => parent.postMessage({ pluginMessage: data }, "*"),
  subscribe: (handler) => {
    const onMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage) {
        handler(event.data.pluginMessage);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  },
  handler: rpcHandler,
});
