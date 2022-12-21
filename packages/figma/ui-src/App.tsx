import { FunctionComponent } from "preact";
import { postMessageToPlugin } from "./common";
import { InstanceEdit } from "./InstanceEdit";
import { RenderIFrame } from "./RenderIFrame";
import { Resizer } from "./Resizer";
import { state } from "./State";

export const App: FunctionComponent = () => {
  const syncAssets = () => {
    postMessageToPlugin({
      type: "syncAssets",
      payload: {
        componentDocs: state.componentDocs,
      },
    });
  };

  return (
    <div className="p-2 flex flex-col gap-2 text-xs">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
        onClick={syncAssets}
      >
        Sync Components & Tokens
      </button>
      <InstanceEdit />
      <RenderIFrame />
      <Resizer />
    </div>
  );
};
