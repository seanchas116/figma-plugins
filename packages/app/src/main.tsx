import React from "react";
import ReactDOMClient from "react-dom/client";
import ReactDOM from "react-dom";
import * as htmlToImage from "html-to-image";
import App from "./App";
import { Button } from "./Button";
import "./index.css";

ReactDOMClient.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const onMessage = async (event: MessageEvent) => {
  if (event.data.type !== "iframe:render") {
    return;
  }

  console.log(event.data);

  const root = document.createElement("div");
  document.body.append(root);
  await new Promise<void>((resolve) => {
    ReactDOM.render(
      <Button width={event.data.width} height={event.data.height} />,
      root,
      () => {
        resolve();
      }
    );
  });
  const button = root.firstElementChild as HTMLElement;
  console.log(button);

  const png = await (await htmlToImage.toBlob(button))?.arrayBuffer();

  root.remove();

  window.parent.postMessage(
    {
      type: "iframe:renderFinish",
      payload: png,
    },
    "*"
  );
};

window.addEventListener("message", onMessage);
