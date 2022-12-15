import * as htmlToImage from "html-to-image";
import { Button } from "./stories/Button";
import ReactDOMClient from "react-dom/client";
import { MessageFromRenderIFrame, MessageToRenderIFrame } from "./message";

const root = document.getElementById("root") as HTMLElement;
const reactRoot = ReactDOMClient.createRoot(root);

async function renderComponent(
  node: JSX.Element,
  options: {
    width: number;
    height: number;
  }
): Promise<ArrayBuffer> {
  reactRoot.render(node);
  await new Promise((resolve) => setTimeout(resolve, 0));

  console.time("htmlToImage");
  const pngURL = await htmlToImage.toPng(
    root.firstElementChild as HTMLElement,
    {
      width: options.width,
      height: options.height,
    }
  );
  const pngBuffer = await fetch(pngURL).then((res) => res.arrayBuffer());
  console.timeEnd("htmlToImage");

  return pngBuffer;
}

const onMessage = async (event: MessageEvent) => {
  if (event.source !== window.parent) {
    return;
  }

  const message: MessageToRenderIFrame = event.data;

  const pngBuffer = await renderComponent(
    // @ts-ignore
    <Button {...message.payload.props} />,
    {
      width: message.payload.width,
      height: message.payload.height,
    }
  );

  const doneMessage: MessageFromRenderIFrame = {
    type: "iframe:renderDone",
    payload: {
      png: pngBuffer,
    },
  };

  window.parent.postMessage(doneMessage, "*");
};

window.addEventListener("message", onMessage);
