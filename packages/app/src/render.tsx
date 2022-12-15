import * as htmlToImage from "html-to-image";
import { Button } from "./stories/Button";
import ReactDOMClient from "react-dom/client";

const onMessage = async (event: MessageEvent) => {
  if (event.data.type !== "iframe:render") {
    return;
  }

  console.log(event.data);

  const root = document.createElement("div");
  document.body.append(root);

  const reactRoot = ReactDOMClient.createRoot(root);
  reactRoot.render(<Button label="Button" />);

  await new Promise((resolve) => requestIdleCallback(resolve));

  console.time("htmlToImage");
  const pngURL = await htmlToImage.toPng(root.firstElementChild as HTMLElement);
  const pngBuffer = await fetch(pngURL).then((res) => res.arrayBuffer());
  console.timeEnd("htmlToImage");

  root.remove();

  window.parent.postMessage(
    {
      type: "iframe:renderFinish",
      payload: pngBuffer,
    },
    "*"
  );
};

window.addEventListener("message", onMessage);
