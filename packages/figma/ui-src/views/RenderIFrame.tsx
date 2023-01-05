import { RPC } from "@uimix/typed-rpc";
import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import { Assets } from "../../data";
import { PluginToUIMessage } from "../../message";
import { RenderIFrameToUIRPC, UIToRenderIFrameRPC } from "../../rpc";
import { postMessageToPlugin } from "../common";
import { state } from "../state/State";

export const RenderIFrame: React.FC = () => {
  const ref = createRef<HTMLIFrameElement>();

  useEffect(() => {
    const iframe = ref.current!;

    const rpcHandler: RenderIFrameToUIRPC = {
      assets: async (assets: Assets) => {
        state.$assets.value = assets;
      },
    };
    const rpc = RPC.toIFrame<RenderIFrameToUIRPC, UIToRenderIFrameRPC>(
      iframe,
      rpcHandler
    );

    window.addEventListener("message", async (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as PluginToUIMessage;

        if (message.type === "render") {
          const result = await rpc.remote.render(
            message.payload.component,
            message.payload.props,
            message.payload.width,
            message.payload.height
          );
          postMessageToPlugin({
            type: "renderDone",
            requestID: message.requestID,
            payload: result,
          });
        }
      }
    });

    postMessageToPlugin({
      type: "ready",
    });
  }, []);

  return (
    <iframe
      className="border border-gray-200"
      ref={ref}
      src="http://localhost:5173/render.html"
    />
  );
};
