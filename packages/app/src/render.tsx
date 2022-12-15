import * as htmlToImage from "html-to-image";
import { Button } from "./stories/Button";
import ReactDOMClient from "react-dom/client";

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
  if (event.data.type !== "iframe:render") {
    return;
  }

  console.log(event.data);

  const pngBuffer = await renderComponent(
    <Button primary label={Date.now().toString()} />,
    {
      width: event.data.width,
      height: event.data.height,
    }
  );

  window.parent.postMessage(
    {
      type: "iframe:renderFinish",
      payload: pngBuffer,
    },
    "*"
  );
};

window.addEventListener("message", onMessage);
