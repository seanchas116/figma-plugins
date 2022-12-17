import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import { MessageToUI } from "../message";
import type {
  MessageFromRenderIFrame,
  MessageToRenderIFrame,
} from "../../app/src/message";
import { postMessageToPlugin } from "./common";
import { state } from "./State";

export const RenderIFrame: React.FC = () => {
  const ref = createRef<HTMLIFrameElement>();

  useEffect(() => {
    const iframe = ref.current!;

    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;

        if (message.type === "render") {
          const renderMessage: MessageToRenderIFrame = {
            type: "render",
            payload: message.payload,
          };
          iframe.contentWindow?.postMessage(renderMessage, "*");
        }
      }

      if (event.source === iframe.contentWindow) {
        const message: MessageFromRenderIFrame = event.data;

        switch (message.type) {
          case "renderDone": {
            postMessageToPlugin({
              type: "renderDone",
              payload: message.payload,
            });
            break;
          }
          case "components": {
            console.log(message.payload);
            state.componentDocs = message.payload.components;
            break;
          }
        }
      }
    });

    postMessageToPlugin({
      type: "ready",
    });
  }, []);

  return (
    <iframe
      className="border border-gray-300"
      ref={ref}
      src="http://localhost:5173/render.html"
    />
  );
};
