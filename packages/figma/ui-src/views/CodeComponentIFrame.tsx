import { rpcToIFrame } from "@uimix/typed-rpc/browser";
import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import { CodeAssets } from "../../types/data";
import {
  CodeComponentIFrameToUIRPC,
  UIToCodeComponentIFrameRPC,
} from "../../types/rpc";
import { rpc, rpcHandler } from "../rpc";
import { state } from "../state/State";

export const CodeComponentIFrame: React.FC = () => {
  const ref = createRef<HTMLIFrameElement>();

  useEffect(() => {
    const iframe = ref.current!;

    const iframeRPCHandler: CodeComponentIFrameToUIRPC = {
      assets: async (assets: CodeAssets) => {
        state.$assets.value = assets;
      },
    };
    const iframeRPC = rpcToIFrame<
      CodeComponentIFrameToUIRPC,
      UIToCodeComponentIFrameRPC
    >(iframe, iframeRPCHandler);

    rpcHandler.renderCodeComponent = async (
      component,
      props,
      width,
      height
    ) => {
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
