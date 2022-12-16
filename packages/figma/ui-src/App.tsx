import { RenderIFrame } from "./RenderIFrame";
import { postMessageToPlugin } from "./common";
import { useEffect, useState } from "preact/hooks";
import { MessageToUI } from "../message";
import { ComponentState } from "../data";

const AutoWidthIcon = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path
        d="M2 8H14M2 8L4 10M2 8L4 6M14 8L12 6M14 8L12 10"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

const AutoHeightIcon = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path
        d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H8"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

const FixedSizeIcon = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect
        x="2.5"
        y="2.5"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        fill="none"
      />
    </svg>
  );
};

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
      <div>
        <button
          className="p-0.5 rounded aria-selected:bg-blue-500 aria-selected:text-white"
          title="Auto Width"
          aria-selected
        >
          <AutoWidthIcon />
        </button>
        <button
          className="p-0.5 rounded aria-selected:bg-blue-500 aria-selected:text-white"
          title="Auto Height"
        >
          <AutoHeightIcon />
        </button>
        <button
          className="p-0.5 rounded aria-selected:bg-blue-500 aria-selected:text-white"
          title="Fixed Size"
        >
          <FixedSizeIcon />
        </button>
      </div>
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
