import { RenderIFrame } from "./RenderIFrame";
import { postMessageToPlugin } from "./common";
import { useEffect, useState } from "preact/hooks";
import { MessageToUI } from "../message";
import { ComponentState } from "../data";

export const App: React.FC = () => {
  const [component, setComponent] = useState<ComponentState>({
    name: undefined,
    props: {},
  });

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;
        if (message.type === "componentChanged") {
          setComponent(message.payload);
        }
      }
    });
  }, []);

  const handleClick = () => {
    postMessageToPlugin({
      type: "updateComponent",
      payload: {
        name: "Button",
        props: {},
      },
    });
  };

  return (
    <div className="p-2 flex flex-col gap-2 text-xs">
      <select
        className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        value={component.name ?? ""}
        onChange={(event) => {
          console.log("change");
          const name = event.currentTarget.value;

          postMessageToPlugin({
            type: "updateComponent",
            payload: {
              ...component,
              name,
            },
          });
        }}
      >
        <option value="">Not Attached</option>
        <option value="Button">Button</option>
        <option value="Checkbox">Checkbox</option>
        <option value="TextField">TextField</option>
      </select>
      <dl className="flex flex-col gap-1">
        <dt className="text-gray-500">Primary</dt>
        <dd>
          <input className="accent-indigo-500" type="checkbox" />
        </dd>
        <dt className="text-gray-500">Label</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            type="text"
          />
        </dd>
      </dl>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
      >
        Attach
      </button>
      <RenderIFrame />
    </div>
  );
};
