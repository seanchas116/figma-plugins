import * as htmlToImage from "html-to-image";
import { Button } from "./stories/Button";
import ReactDOMClient from "react-dom/client";
import { MessageFromRenderIFrame, MessageToRenderIFrame } from "./message";
import { Header } from "./stories/Header";
import React from "react";

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

const components = [
  {
    name: "Button",
    component: Button,
    props: [
      {
        name: "label",
        type: "string",
      },
      {
        name: "size",
        type: "enum", // TODO
      },
      {
        name: "primary",
        type: "boolean",
      },
    ],
  },
  {
    name: "Header",
    component: Header,
    props: [],
  },
];

const componentMap = new Map<string, React.FC<any>>(
  components.map((component) => [component.name, component.component])
);

const onMessage = async (event: MessageEvent) => {
  if (event.source !== window.parent) {
    return;
  }

  const message: MessageToRenderIFrame = event.data;

  const Component = componentMap.get(message.payload.name) ?? Button;

  const result = await renderComponent(
    // @ts-ignore
    <Component {...message.payload.props} />,
    {
      width: message.payload.width,
      height: message.payload.height,
    }
  );

  sendMessage({
    type: "renderDone",
    payload: result,
  });
};

function sendMessage(message: MessageFromRenderIFrame) {
  window.parent.postMessage(message, "*");
}

window.addEventListener("message", onMessage);

sendMessage({
  type: "components",
  payload: {
    components: components.map((c) => ({
      name: c.name,
      props: c.props,
    })),
  },
});
