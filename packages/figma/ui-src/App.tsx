import { RenderIFrame } from "./RenderIFrame";
import { postMessageToPlugin } from "./common";
import { useEffect } from "preact/hooks";
import { MessageToUI } from "../message";
import { ComponentState } from "../data";
import { state } from "./State";

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
  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;
        if (message.type === "componentChanged") {
          state.component = message.payload.component;
        }
      }
    });
  }, []);

  const updateComponent = (component: ComponentState | undefined) => {
    state.component = component;
    postMessageToPlugin({
      type: "updateComponent",
      payload: {
        component,
      },
    });
  };

  const component = state.component;

  return (
    <div className="p-2 flex flex-col gap-2 text-xs">
      <select
        className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={component?.name ?? ""}
        onChange={(event) => {
          const name = event.currentTarget.value;

          updateComponent(
            name
              ? {
                  name,
                  props: component?.props ?? {},
                  autoResize: component?.autoResize ?? "none",
                }
              : undefined
          );
        }}
      >
        <option value="">Not Attached</option>
        <option value="Button">Button</option>
        <option value="Header">Header</option>
      </select>
      <div>
        <button
          className="p-0.5 rounded text-gray-500 hover:bg-gray-100 aria-selected:bg-blue-500 aria-selected:text-white"
          title="Auto Width"
          aria-selected={component?.autoResize === "widthHeight"}
          onClick={() => {
            if (!component) {
              return;
            }
            updateComponent({
              ...component,
              autoResize: "widthHeight",
            });
          }}
        >
          <AutoWidthIcon />
        </button>
        <button
          className="p-0.5 rounded text-gray-500 hover:bg-gray-100 aria-selected:bg-blue-500 aria-selected:text-white"
          title="Auto Height"
          aria-selected={component?.autoResize === "height"}
          onClick={() => {
            if (!component) {
              return;
            }
            updateComponent({
              ...component,
              autoResize: "height",
            });
          }}
        >
          <AutoHeightIcon />
        </button>
        <button
          className="p-0.5 rounded text-gray-500 hover:bg-gray-100 aria-selected:bg-blue-500 aria-selected:text-white"
          title="Fixed Size"
          aria-selected={component?.autoResize === "none"}
          onClick={() => {
            if (!component) {
              return;
            }
            updateComponent({
              ...component,
              autoResize: "none",
            });
          }}
        >
          <FixedSizeIcon />
        </button>
      </div>
      <dl className="grid grid-cols-[1fr_2fr] gap-1 items-center">
        <dt className="text-gray-500">Primary</dt>
        <dd>
          <input
            className="accent-blue-500"
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
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
