import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import { MessageToPlugin, MessageToUI } from "../message";
import type { AppRouter } from "../../electron/src/server";

function postMessageToPlugin(data: MessageToPlugin): void {
  parent.postMessage({ pluginMessage: data }, "*");
}

async function postMessageToElectron() {
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/trpc",
      }),
    ],
  });

  console.log("call tRPC");

  const res = await trpc.capture.query({
    width: 100,
    height: 100,
  });
  console.log(res);
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

    postMessageToElectron();
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
    <div className="p-2 flex flex-col gap-2">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
      >
        Attach
      </button>
      <iframe ref={iframeRef} src="http://localhost:5173" />
    </div>
  );
};
