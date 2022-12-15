import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import { MessageToUI } from "../message";
import type {
  MessageFromRenderIFrame,
  MessageToRenderIFrame,
} from "../../app/src/message";
import { postMessageToPlugin } from "./common";

export const RenderIFrame: React.FC = () => {
  const ref = createRef<HTMLIFrameElement>();

  useEffect(() => {
    const iframe = ref.current!;

    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;

        const renderMessage: MessageToRenderIFrame = {
          type: "iframe:render",
          payload: {
            component: "Button",
            props: {},
            width: message.width,
            height: message.height,
          },
        };
        iframe.contentWindow?.postMessage(renderMessage, "*");
      }

      if (event.source === iframe.contentWindow) {
        const message: MessageFromRenderIFrame = event.data;
        postMessageToPlugin({
          type: "renderFinish",
          payload: message.payload.png,
        });
      }
    });
  }, []);

  return <iframe ref={ref} src="http://localhost:5173/render.html" />;
};
