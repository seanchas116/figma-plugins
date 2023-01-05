import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import {
  RenderIFrameToUIMessage,
  UIToRenderIFrameMessage,
  PluginToUIMessage,
} from "../../message";
import { postMessageToPlugin } from "../common";
import { state } from "../state/State";

export const RenderIFrame: React.FC = () => {
  const ref = createRef<HTMLIFrameElement>();

  useEffect(() => {
    const iframe = ref.current!;

    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as PluginToUIMessage;

        if (message.type === "render") {
          const renderMessage: UIToRenderIFrameMessage = {
            type: "render",
            requestID: message.requestID,
            payload: message.payload,
          };
          iframe.contentWindow?.postMessage(renderMessage, "*");
        }
      }

      if (event.source === iframe.contentWindow) {
        const message: RenderIFrameToUIMessage = event.data;

        switch (message.type) {
          case "renderDone": {
            postMessageToPlugin({
              type: "renderDone",
              requestID: message.requestID,
              payload: message.payload,
            });
            break;
          }
          case "assets": {
            console.log(message.payload);
            state.$assets.value = {
              components: message.payload.components,
              colorStyles: message.payload.colorStyles,
              textStyles: message.payload.textStyles,
            };
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
