import { RenderIFrame } from "./RenderIFrame";
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
  const component = state.component;
  const componentDoc = state.componentDocs.find(
    (doc) =>
      doc.filePath === component?.path && doc.displayName === component?.name
  );

  return (
    <div className="p-2 flex flex-col gap-2 text-xs">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
        Sync Components & Tokens
      </button>
      <select
        className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={
          component ? JSON.stringify([component.path, component.name]) : ""
        }
        onChange={(event) => {
          const value = event.currentTarget.value;
          if (!value) {
            state.updateComponent(undefined);
            return;
          }

          const [path, name] = JSON.parse(value) as [string, string];

          state.updateComponent({
            path,
            name,
            props: component?.props ?? {},
            autoResize: component?.autoResize ?? "none",
          });
        }}
      >
        <option value="">Not Attached</option>
        {state.componentDocs.map((doc) => (
          <option value={JSON.stringify([doc.filePath, doc.displayName])}>
            {doc.displayName}
          </option>
        ))}
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
            state.updateComponent({
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
            state.updateComponent({
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
            state.updateComponent({
              ...component,
              autoResize: "none",
            });
          }}
        >
          <FixedSizeIcon />
        </button>
      </div>
      <dl className="grid grid-cols-[1fr_2fr] gap-1 items-center">
        {componentDoc &&
          Object.values(componentDoc.props).map((prop) => {
            const name = prop.name;
            const value = component?.props?.[name];

            let input: JSX.Element | undefined;

            if (prop.type.name === "enum") {
              input = (
                <select
                  className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={value ?? ""}
                  onChange={(event) => {
                    state.updateComponentProps({
                      [name]: event.currentTarget.value,
                    });
                  }}
                >
                  {prop.type.value.map((value: { value: string }) => {
                    try {
                      const rawValue = JSON.parse(value.value);
                      return <option value={rawValue}>{rawValue}</option>;
                    } catch {
                      return null;
                    }
                  })}
                </select>
              );
            } else if (prop.type.name === "string") {
              input = (
                <input
                  className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  type="text"
                  value={value ?? ""}
                  onChange={(event) => {
                    state.updateComponentProps({
                      [name]: event.currentTarget.value,
                    });
                  }}
                />
              );
            } else if (prop.type.name === "boolean") {
              input = (
                <input
                  className="accent-blue-500"
                  type="checkbox"
                  checked={value ?? false}
                  onChange={(event) => {
                    state.updateComponentProps({
                      [name]: event.currentTarget.checked,
                    });
                  }}
                />
              );
            }

            return (
              <>
                <dt className="text-gray-500">{name}</dt>
                <dd>{input}</dd>
              </>
            );
          })}
      </dl>
      <RenderIFrame />
    </div>
  );
};
