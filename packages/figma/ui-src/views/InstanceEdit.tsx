import { FunctionComponent } from "preact";
import { componentKey } from "../../types/data";
import { state } from "../state/State";
import {
  AutoHeightIcon,
  AutoWidthIcon,
  ChevronDownIcon,
  FixedSizeIcon,
} from "../components/Icon";
import { styled } from "./styled";

const SizingButton = styled(
  "button",
  "p-1 rounded text-gray-500 hover:bg-gray-100 aria-selected:bg-blue-500 aria-selected:text-white"
);

export const InstanceEdit: FunctionComponent = () => {
  const instance = state.target;
  if (!instance) {
    return null;
  }

  const componentDoc = state.componentDocs.find(
    (doc) => componentKey(doc) === componentKey(instance.component)
  );

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold text-xs">
        {componentDoc?.name ?? "Component Not Found"}
      </h1>
      <div className="flex">
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
                <div className="relative w-fit">
                  <select
                    className="appearance-none pr-4 p-1 -m-1 outline outline-1 outline-transparent hover:outline-gray-300 focus:outline-blue-500 placeholder:text-gray-400"
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
                  <ChevronDownIcon
                    width={12}
                    height={12}
                    className="pointer-events-none absolute right-0 top-0 bottom-0 my-auto"
                  />
                </div>
              );
            } else if (prop.type.name === "string") {
              input = (
                <input
                  type="text"
                  className="w-full p-1 -m-1 outline outline-1 outline-transparent hover:outline-gray-300 focus:outline-blue-500 placeholder:text-gray-300"
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
