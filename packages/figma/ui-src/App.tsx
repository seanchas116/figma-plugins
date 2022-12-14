import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { createRef } from "preact";
import { useEffect } from "preact/hooks";
import { MessageToPlugin, MessageToUI } from "../message";
import type { AppRouter } from "../../electron/src/server";
import { Buffer } from "buffer";

function postMessageToPlugin(data: MessageToPlugin): void {
  parent.postMessage({ pluginMessage: data }, "*");
}

async function renderInElectron(width: number, height: number) {
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/trpc",
      }),
    ],
  });

  console.log("call tRPC");

  const res = await trpc.capture.query({
    width,
    height,
  });
  console.log(res);
  const base64 = res.dataURL.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  console.log(buffer);

  postMessageToPlugin({
    type: "renderFinish",
    payload: buffer,
  });
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
    window.addEventListener("message", async (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;
        await renderInElectron(message.width, message.height);
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
