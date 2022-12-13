import { MessageToPlugin } from "../message";
import React from "react";

function postMessageToPlugin(data: MessageToPlugin): void {
  parent.postMessage({ pluginMessage: data }, "*");
}

export const App: React.FC = () => {
  return (
    <div className="p-2">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Render
      </button>
      <iframe src="http://localhost:5173" />
    </div>
  );
};
