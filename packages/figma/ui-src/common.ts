import { PluginToUIMessage, UIToPluginMessage } from "../message";

export function postMessageToPlugin(data: UIToPluginMessage): void {
  parent.postMessage({ pluginMessage: data }, "*");
}

export function onMessageFromPlugin(
  callback: (message: PluginToUIMessage) => void
): () => void {
  const onMessage = (event: MessageEvent) => {
    if (event.data.pluginMessage) {
      callback(event.data.pluginMessage);
    }
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
