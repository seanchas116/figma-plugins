import * as htmlToImage from "html-to-image";
import { Button } from "./stories/Button";
import ReactDOMClient from "react-dom/client";
import { MessageFromRenderIFrame, MessageToRenderIFrame } from "./message";

const root = document.getElementById("root") as HTMLElement;
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

  const pixelRatio = 2;

  console.time("htmlToImage");
  const canvas = await htmlToImage.toCanvas(
    root.firstElementChild as HTMLElement,
    {
      pixelRatio,
      width: options.width,
      height: options.height,
    }
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

const onMessage = async (event: MessageEvent) => {
  if (event.source !== window.parent) {
    return;
  }

  const message: MessageToRenderIFrame = event.data;

  const result = await renderComponent(
    // @ts-ignore
    <Button {...message.payload.props} />,
    {
      width: message.payload.width,
      height: message.payload.height,
    }
  );

  const doneMessage: MessageFromRenderIFrame = {
    type: "iframe:renderDone",
    payload: result,
  };

  window.parent.postMessage(doneMessage, "*");
};

window.addEventListener("message", onMessage);
