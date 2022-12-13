import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import { MessageToPlugin, MessageToUI } from "../message";

function postMessageToPlugin(data: MessageToPlugin): void {
  parent.postMessage({ pluginMessage: data }, "*");
}

export const App: React.FC = () => {
  const iframeRef = createRef<HTMLIFrameElement>();

  const handleClick = () => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    postMessageToPlugin({
      type: "renderStart",
    });
  };

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;

        iframeRef.current!.contentWindow?.postMessage(
          {
            type: "iframe:render",
            width: message.width,
            height: message.height,
          },
          "*"
        );
      }

      if (event.data.type === "iframe:renderFinish") {
        postMessageToPlugin({
          type: "renderFinish",
          payload: event.data.payload,
        });
      }
    });
  }, []);

  return (
    <div className="p-2">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
      >
        Render
      </button>
      <iframe ref={iframeRef} src="http://localhost:5173" />
    </div>
  );
};
