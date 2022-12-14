import React from "react";
import ReactDOMClient from "react-dom/client";
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

let oldRenderRoot: ReactDOMClient.Root | undefined;

const onMessage = async (event: MessageEvent) => {
  switch (event.data.type) {
    case "iframe:render": {
      console.log(event.data);

      const root = document.createElement("div");
      document.body.append(root);
      const reactRoot = ReactDOMClient.createRoot(root);
      reactRoot.render(
        <Button width={event.data.width} height={event.data.height} />
      );
      await new Promise<void>((resolve) => {
        requestIdleCallback(() => resolve());
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
      break;
    }
    case "electron:render": {
      console.log(event.data);

      if (oldRenderRoot) {
        oldRenderRoot.unmount();
      }
      if (document.getElementById("renderRoot")) {
        document.getElementById("renderRoot")?.remove();
      }

      const root = document.createElement("div");
      root.id = "renderRoot";
      document.body.append(root);
      const reactRoot = ReactDOMClient.createRoot(root);
      reactRoot.render(
        <Button width={event.data.width} height={event.data.height} />
      );
      await new Promise<void>((resolve) => {
        requestIdleCallback(() => resolve());
      });
      const button = root.firstElementChild as HTMLElement;
      console.log(button);

      oldRenderRoot = reactRoot;

      window.postMessage({
        type: "electron:renderFinish",
        left: button.offsetLeft,
        top: button.offsetTop,
        width: button.offsetWidth,
        height: button.offsetHeight,
      });

      break;
    }
  }
};

window.addEventListener("message", onMessage);
