import { FunctionComponent } from "preact";
import { componentKey } from "../../data";
import { state } from "../state/State";
import { AutoHeightIcon, AutoWidthIcon, FixedSizeIcon } from "./icons";
import { styled } from "./styled";

const SizingButton = styled(
  "button",
  "p-1 rounded text-gray-500 hover:bg-gray-100 aria-selected:bg-blue-500 aria-selected:text-white"
);

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
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold text-xs">
        {componentDoc?.name ?? "Component Not Found"}
      </h1>
      <div className="flex -my-1">
        <SizingButton
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
        </SizingButton>
        <SizingButton
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
        </SizingButton>
        <SizingButton
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
        </SizingButton>
      </div>
      <dl className="grid grid-cols-[1fr_2fr] gap-3 items-center">
        {componentDoc &&
          Object.values(componentDoc.props).map((prop) => {
            const name = prop.name;
            const value = instance.props?.[name];

            let input: JSX.Element | undefined;

            if (prop.type.name === "enum") {
              input = (
                <select
                  className="p-0"
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
                  type="text"
                  className="w-full p-1 -m-1 outline outline-1 outline-transparent hover:outline-gray-300 focus:outline-blue-500"
                  value={value ?? ""}
                  placeholder="String"
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
            // TODO: number
            if (!input) {
              return null;
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
