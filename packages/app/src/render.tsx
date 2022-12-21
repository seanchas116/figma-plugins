import * as htmlToImage from "html-to-image";
import ReactDOMClient from "react-dom/client";
import { MessageFromRenderIFrame, MessageToRenderIFrame } from "./message";
import React from "react";
import { ComponentDoc } from "react-docgen-typescript";
import componentDocs from "./docs.json";
import { colors } from "./tokens";

const root = document.getElementById("root") as HTMLElement;
root.style.width = "max-content";
const reactRoot = ReactDOMClient.createRoot(root);

async function renderComponent(
  node: JSX.Element,
  options: {
    width?: number;
    height?: number;
  }
): Promise<{
  png: ArrayBuffer;
  width: number;
  height: number;
}> {
  reactRoot.render(node);
  await new Promise((resolve) => setTimeout(resolve, 0));

  const element = root.firstElementChild as HTMLElement;
  element.style.width = options.width ? `${options.width}px` : "";
  element.style.height = options.height ? `${options.height}px` : "";

  const pixelRatio = 2;

  console.time("htmlToImage");
  const canvas = await htmlToImage.toCanvas(
    root.firstElementChild as HTMLElement,
    { pixelRatio }
  );
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

const componentDocMap = new Map<string, ComponentDoc>(
  (componentDocs as any as ComponentDoc[]).map((componentDoc) => [
    componentDoc.filePath + "#" + componentDoc.displayName,
    componentDoc,
  ])
);

async function getComponent(
  componentDoc: ComponentDoc
): Promise<React.ComponentType<any> | undefined> {
  return (await import("../../" + componentDoc.filePath))[
    componentDoc.displayName
  ];
}

const onMessage = async (event: MessageEvent) => {
  if (event.source === window || event.source !== window.parent) {
    return;
  }

  const message: MessageToRenderIFrame = event.data;

  const componentDoc = componentDocMap.get(
    message.payload.path + "#" + message.payload.name
  );
  const Component = componentDoc && (await getComponent(componentDoc));

  const result = await renderComponent(
    Component ? <Component {...message.payload.props} /> : <div />,
    {
      width: message.payload.width,
      height: message.payload.height,
    }
  );

  sendMessage({
    type: "renderDone",
    requestID: message.requestID,
    payload: result,
  });
};

function sendMessage(message: MessageFromRenderIFrame) {
  window.parent.postMessage(message, "*");
}

window.addEventListener("message", onMessage);

sendMessage({
  type: "assets",
  payload: {
    components: componentDocs as any as ComponentDoc[],
    colors,
  },
});
