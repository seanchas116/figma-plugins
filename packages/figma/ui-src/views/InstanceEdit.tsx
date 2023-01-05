import { FunctionComponent } from "preact";
import { componentKey } from "../../data";
import { state } from "../state/State";
import { AutoHeightIcon, AutoWidthIcon, FixedSizeIcon } from "./icons";

export const InstanceEdit: FunctionComponent = () => {
  const target = state.target;
  if (!target) {
    return null;
  }

  const componentDoc = state.componentDocs.find(
    (doc) => componentKey(doc) === componentKey(target.component)
  );
  const instance = target.instance;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="mt-2 font-bold text-sm">
        {componentDoc?.name ?? "Component Not Found"}
      </h1>
      <div>
        <button
          className="p-0.5 rounded text-gray-500 hover:bg-gray-100 aria-selected:bg-blue-500 aria-selected:text-white"
          title="Auto Width"
          aria-selected={instance.autoResize === "widthHeight"}
          onClick={() => {
            state.updateInstance({
              ...instance,
              autoResize: "widthHeight",
            });
          }}
        >
          <AutoWidthIcon />
        </button>
        <button
          className="p-0.5 rounded text-gray-500 hover:bg-gray-100 aria-selected:bg-blue-500 aria-selected:text-white"
          title="Auto Height"
          aria-selected={instance.autoResize === "height"}
          onClick={() => {
            state.updateInstance({
              ...instance,
              autoResize: "height",
            });
          }}
        >
          <AutoHeightIcon />
        </button>
        <button
          className="p-0.5 rounded text-gray-500 hover:bg-gray-100 aria-selected:bg-blue-500 aria-selected:text-white"
          title="Fixed Size"
          aria-selected={instance.autoResize === "none"}
          onClick={() => {
            state.updateInstance({
              ...instance,
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
            const value = instance.props?.[name];

            let input: JSX.Element | undefined;

            if (prop.type.name === "enum") {
              input = (
                <select
                  className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={value ?? ""}
                  onChange={(event) => {
                    state.updateInstanceProps({
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
                    state.updateInstanceProps({
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
                    state.updateInstanceProps({
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
    </div>
  );
};