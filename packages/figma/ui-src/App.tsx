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
    <div className="p-2 flex flex-col gap-2 text-xs">
      <select className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        <option value="">Not Attached</option>
        <option value="Button">Button</option>
        <option value="Checkbox">Checkbox</option>
        <option value="TextField">TextField</option>
      </select>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
      >
        Attach
      </button>
      <iframe ref={iframeRef} src="http://localhost:5173/render.html" />
    </div>
  );
};
