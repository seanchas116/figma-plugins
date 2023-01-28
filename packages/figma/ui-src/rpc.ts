import { RPC } from "@uimix/typed-rpc";
import { action } from "mobx";
import { Target } from "../types/data";
import { IPluginToUIRPC, IUIToPluginRPC } from "../types/rpc";
import { state } from "./state/State";

export const rpcHandler: IPluginToUIRPC = {
  renderCodeComponent: async (): Promise<{
    png: ArrayBuffer;
    width: number;
    height: number;
    // eslint-disable-next-line @typescript-eslint/require-await
  }> => {
    throw new Error("Function not implemented.");
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  onTargetsChange: action(async (targets: Target[]) => {
    console.log(targets);
    state.targets = targets;
  }),
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
