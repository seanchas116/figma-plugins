import { MessageToPlugin } from "../message";
import React from "react";

function postMessageToPlugin(data: MessageToPlugin): void {
  parent.postMessage({ pluginMessage: data }, "*");
}

export const App: React.FC = () => {
  return <div className="text-red">Hello</div>;
};
