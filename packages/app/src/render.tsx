import * as htmlToImage from "html-to-image";
import ReactDOMClient from "react-dom/client";
import React from "react";
import type { RenderIFrameToUIRPC, UIToRenderIFrameRPC } from "../../figma/rpc";
import { assets } from "./designSystem";
import {
  ComponentInfo,
  componentKey,
  ComponentMetadata,
} from "../../figma/data";
import { RPC } from "@uimix/typed-rpc";

const root = document.getElementById("root") as HTMLElement;
root.style.width = "max-content";
const reactRoot = ReactDOMClient.createRoot(root);

async function renderComponent(node: JSX.Element): Promise<{
  png: ArrayBuffer;
  width: number;
  height: number;
}> {
  reactRoot.render(node);
  await new Promise((resolve) => setTimeout(resolve, 0));

  const pixelRatio = 2;

  console.time("htmlToImage");
  const canvas = await htmlToImage.toCanvas(root, { pixelRatio });
  const width = Math.round(canvas.width / pixelRatio);
  const height = Math.round(canvas.height / pixelRatio);
  const pngURL = canvas.toDataURL("image/png");
  const pngBuffer = await fetch(pngURL).then((res) => res.arrayBuffer());
  console.timeEnd("htmlToImage");

  return {
    png: pngBuffer,
    width,
    height,
  };
}

const componentMetadataMap = new Map<string, ComponentMetadata>(
  assets.components.map((metadata) => [componentKey(metadata), metadata])
);

async function getComponent(
  componentDoc: ComponentMetadata
): Promise<React.ComponentType<any> | undefined> {
  return (await import("../../" + componentDoc.internalPath))[
    componentDoc.name
  ];
}

class RPCHandler implements UIToRenderIFrameRPC {
  async render(
    component: ComponentInfo,
    props: Record<string, any>,
    width?: number | undefined,
    height?: number | undefined
  ): Promise<{ png: ArrayBuffer; width: number; height: number }> {
    const componentDoc = componentMetadataMap.get(componentKey(component));
    const Component = componentDoc && (await getComponent(componentDoc));

    const result = await renderComponent(
      Component ? (
        <Component
          {...props}
          style={{
            width: width ? width + "px" : undefined,
            height: height ? height + "px" : undefined,
          }}
        />
      ) : (
        <div />
      )
    );
    return result;
  }
}

const rpc = new RPC<UIToRenderIFrameRPC, RenderIFrameToUIRPC>(
  (message) => window.parent.postMessage(message, "*"),
  (handler) => {
    window.addEventListener("message", (event) => {
      if (event.source === window || event.source !== window.parent) {
        return;
      }
      handler(event.data);
    });
  },
  new RPCHandler()
);

rpc.remote.assets(assets);
