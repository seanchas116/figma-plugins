import * as htmlToImage from "html-to-image";
import ReactDOMClient from "react-dom/client";
import React from "react";
import type {
  RenderIFrameToUIMessage,
  UIToRenderIFrameMessage,
} from "../../figma/message";
import { assets } from "./designSystem";
import { ComponentMetadata } from "../../figma/data";

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
  assets.components.map((metadata) => [
    metadata.path + "#" + metadata.name,
    metadata,
  ])
);

async function getComponent(
  componentDoc: ComponentMetadata
): Promise<React.ComponentType<any> | undefined> {
  return (await import("../../" + componentDoc.path))[componentDoc.name];
}

const onMessage = async (event: MessageEvent) => {
  if (event.source === window || event.source !== window.parent) {
    return;
  }

  const message: UIToRenderIFrameMessage = event.data;

  const componentDoc = componentMetadataMap.get(
    message.payload.path + "#" + message.payload.name
  );
  const Component = componentDoc && (await getComponent(componentDoc));

  const result = await renderComponent(
    Component ? (
      <Component
        {...message.payload.props}
        style={{
          width: message.payload.width
            ? message.payload.width + "px"
            : undefined,
          height: message.payload.height
            ? message.payload.height + "px"
            : undefined,
        }}
      />
    ) : (
      <div />
    )
  );

  sendMessage({
    type: "renderDone",
    requestID: message.requestID,
    payload: result,
  });
};

function sendMessage(message: RenderIFrameToUIMessage) {
  window.parent.postMessage(message, "*");
}

window.addEventListener("message", onMessage);

sendMessage({
  type: "assets",
  payload: assets,
});
