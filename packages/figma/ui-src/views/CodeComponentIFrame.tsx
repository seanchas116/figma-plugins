import { rpcToIFrame } from "@uimix/typed-rpc/browser";
import { createRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { CodeAssets } from "../../types/data";
import {
  CodeComponentIFrameToUIRPC,
  UIToCodeComponentIFrameRPC,
} from "../../types/rpc";
import { rpc, rpcHandler } from "../rpc";
import { state } from "../state/State";

export const CodeComponentIFrame: React.FC<{
  visible?: boolean;
}> = ({ visible }) => {
  const ref = createRef<HTMLIFrameElement>();

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) {
      return;
    }

    const iframeRPCHandler: CodeComponentIFrameToUIRPC = {
      // eslint-disable-next-line @typescript-eslint/require-await
      assets: async (assets: CodeAssets) => {
        state.assets = assets;
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

    void rpc.remote.ready();
  }, []);

  return (
    <iframe
      className={twMerge(
        "border border-gray-200",
        !visible ? "fixed left-[-1000px]" : ""
      )}
      ref={ref}
      src="http://localhost:5173/render.html"
    />
  );
};
