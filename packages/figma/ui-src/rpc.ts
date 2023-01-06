import { RPC } from "@uimix/typed-rpc";
import { CodeComponentInfo, Target } from "../types/data";
import { IPluginToUIRPC, IUIToPluginRPC } from "../types/rpc";
import { state } from "./state/State";

export const rpcHandler: IPluginToUIRPC = {
  renderCodeComponent: async (
    component: CodeComponentInfo,
    props: Record<string, any>,
    width?: number | undefined,
    height?: number | undefined
  ): Promise<{ png: ArrayBuffer; width: number; height: number }> => {
    throw new Error("Function not implemented.");
  },
  onTargetsChange: async (targets: Target[]) => {
    state.$target.value = targets[0];
    console.log("onTargetsChange", targets);
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
