import { rpcToIFrame } from "@uimix/typed-rpc/browser";
import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import { Assets } from "../../types/data";
import { RenderIFrameToUIRPC, UIToRenderIFrameRPC } from "../../types/rpc";
import { rpc, rpcHandler } from "../rpc";
import { state } from "../state/State";

export const RenderIFrame: React.FC = () => {
  const ref = createRef<HTMLIFrameElement>();

  useEffect(() => {
    const iframe = ref.current!;

    const iframeRPCHandler: RenderIFrameToUIRPC = {
      assets: async (assets: Assets) => {
        state.$assets.value = assets;
      },
    };
    const iframeRPC = rpcToIFrame<RenderIFrameToUIRPC, UIToRenderIFrameRPC>(
      iframe,
      iframeRPCHandler
    );

    rpcHandler.render = async (component, props, width, height) => {
      return iframeRPC.remote.render(component, props, width, height);
    };

    rpc.remote.ready();
  }, []);

  return (
    <iframe
      className="border border-gray-200"
      ref={ref}
      src="http://localhost:5173/render.html"
    />
  );
};
