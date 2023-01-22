import * as htmlToImage from "html-to-image";
import ReactDOMClient from "react-dom/client";
import React from "react";
import type {
  CodeComponentIFrameToUIRPC,
  UIToCodeComponentIFrameRPC,
} from "../../figma/types/rpc";
import { assets } from "./designSystem";
import {
  CodeComponentInfo,
  CodeComponentMetadata,
} from "../../figma/types/data";
import { rpcToParentWindow } from "@uimix/typed-rpc/browser";

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

const componentMetadataMap = new Map<string, CodeComponentMetadata>(
  assets.components.map((metadata) => [
    CodeComponentInfo.key(metadata),
    metadata,
  ])
);

async function getComponent(
  componentDoc: CodeComponentMetadata
): Promise<React.ComponentType<any> | undefined> {
  return (await import("../../" + componentDoc.internalPath))[
    componentDoc.name
  ];
}

class RPCHandler implements UIToCodeComponentIFrameRPC {
  async render(
    component: CodeComponentInfo,
    props: Record<string, any>,
    width?: number | undefined,
    height?: number | undefined
  ): Promise<{ png: ArrayBuffer; width: number; height: number }> {
    const componentDoc = componentMetadataMap.get(
      CodeComponentInfo.key(component)
    );
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

const rpc = rpcToParentWindow<
  UIToCodeComponentIFrameRPC,
  CodeComponentIFrameToUIRPC
>(new RPCHandler());

void rpc.remote.assets(assets);
