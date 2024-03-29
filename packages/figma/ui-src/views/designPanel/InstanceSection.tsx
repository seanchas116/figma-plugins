import { state } from "../../state/State";
import {
  AutoHeightIcon,
  AutoWidthIcon,
  FixedSizeIcon,
} from "../../components/Icon";
import { styled } from "../../components/styled";
import { CodeComponentInfo } from "../../../types/data";
import { Input, Select } from "../../components/Input";
import { Tooltip } from "../../components/Tooltip";
import { observer } from "mobx-react-lite";
import { MIXED, sameOrMixed } from "../../util/Mixed";

const SizingButton = styled(
  "button",
  "p-1 rounded text-gray-900 hover:bg-gray-100 aria-selected:bg-gray-200"
);

export const InstanceSection: React.FC = observer(() => {
  const instance = sameOrMixed(state.targets.map((t) => t.instance));
  if (!instance || instance === MIXED) {
    return null;
  }

  const componentDoc = state.componentDocs.find(
    (doc) =>
      CodeComponentInfo.key(doc) === CodeComponentInfo.key(instance.component)
  );

  return (
    <div className="px-4 py-3 flex flex-col gap-3 border-b border-gray-200">
      <div className="flex justify-between">
        <h1 className="font-semibold text-xs">
          {componentDoc?.name ?? "Component Not Found"}
        </h1>
        <div className="flex -m-1">
          <Tooltip text="Auto Width">
            <SizingButton
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
          </Tooltip>
          <Tooltip text="Auto Height">
            <SizingButton
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
          </Tooltip>
          <Tooltip text="Fixed Size">
            <SizingButton
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
          </Tooltip>
        </div>
      </div>
      <dl className="grid grid-cols-[1fr_2fr] gap-3 items-center">
        {componentDoc &&
          Object.values(componentDoc.props).map((prop) => {
            const name = prop.name;
            const value = instance.props?.[name];

            let input: JSX.Element | undefined;

            if (prop.type.name === "enum") {
              input = (
                <Select
                  value={value ?? ""}
                  onChange={(event) => {
                    state.updateInstanceProps({
                      [name]: event.currentTarget.value,
                    });
                  }}
                >
                  {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    prop.type.value.map((value: { value: string }) => {
                      try {
                        const rawValue = JSON.parse(value.value);
                        return <option value={rawValue}>{rawValue}</option>;
                      } catch {
                        return null;
                      }
                    })
                  }
                </Select>
              );
            } else if (prop.type.name === "string") {
              input = (
                <Input
                  type="text"
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
});
