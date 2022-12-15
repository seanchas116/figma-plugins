import { RenderIFrame } from "./RenderIFrame";
import { postMessageToPlugin } from "./common";
import { useEffect, useState } from "preact/hooks";
import { MessageToUI } from "../message";
import { ComponentState } from "../data";

export const App: React.FC = () => {
  const [component, setComponent] = useState<ComponentState | undefined>();

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;
        if (message.type === "componentChanged") {
          setComponent(message.payload.component);
        }
      }
    });
  }, []);

  const updateComponent = (component: ComponentState | undefined) => {
    setComponent(component);
    postMessageToPlugin({
      type: "updateComponent",
      payload: {
        component,
      },
    });
  };

  return (
    <div className="p-2 flex flex-col gap-2 text-xs">
      <select
        className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        value={component?.name ?? ""}
        onChange={(event) => {
          const name = event.currentTarget.value;

          updateComponent(
            name
              ? {
                  name,
                  props: component?.props ?? {},
                }
              : undefined
          );
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
          <input
            className="accent-indigo-500"
            type="checkbox"
            checked={component?.props?.primary ?? false}
            onChange={(event) => {
              if (!component) {
                return;
              }
              console.log("onchange");
              const primary = event.currentTarget.checked;
              updateComponent({
                ...component,
                props: {
                  ...component.props,
                  primary,
                },
              });
            }}
          />
        </dd>
        <dt className="text-gray-500">Size</dt>
        <dd>
          <select
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={component?.props?.size ?? "medium"}
            onChange={(event) => {
              if (!component) {
                return;
              }

              const size = event.currentTarget.value;
              updateComponent({
                ...component,
                props: {
                  ...component.props,
                  size,
                },
              });
            }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </dd>
        <dt className="text-gray-500">Label</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            type="text"
            value={component?.props?.label ?? ""}
            onChange={(event) => {
              if (!component) {
                return;
              }
              const label = event.currentTarget.value;
              updateComponent({
                ...component,
                props: {
                  ...component.props,
                  label,
                },
              });
            }}
          />
        </dd>
      </dl>
      {/* <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
      >
        Attach
      </button> */}
      <RenderIFrame />
    </div>
  );
};
