import { state } from "../state/State";
import {
  AutoHeightIcon,
  AutoWidthIcon,
  FixedSizeIcon,
} from "../components/Icon";
import { styled } from "../components/styled";
import { CodeComponentInfo } from "../../types/data";
import { Input, Select } from "../components/Input";
import { Tooltip } from "../components/Tooltip";
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";
import { MIXED, sameOrMixed } from "../util/Mixed";
import clsx from "clsx";
import { rpc } from "../rpc";
import { Button } from "../components/Button";

const SizingButton = styled(
  "button",
  "p-1 rounded text-gray-900 hover:bg-gray-100 aria-selected:bg-gray-200"
);

export const InstanceEdit: React.FC = observer(() => {
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

const breakpoints = [
  {
    width: 0,
    label: "SM",
    icon: <Icon icon="material-symbols:phone-iphone-outline" />,
  },
  {
    width: 768,
    label: "MD",
    icon: <Icon icon="material-symbols:tablet-mac-outline" />,
  },
  {
    width: 1024,
    label: "LG",
    icon: <Icon icon="material-symbols:laptop-mac-outline" />,
  },
  {
    width: 1280,
    label: "XL",
    icon: <Icon icon="material-symbols:desktop-mac-outline" />,
  },
] as const;

export const DesignPanel: React.FC = observer(() => {
  return (
    <div>
      <div className="px-4 py-3 flex flex-col gap-3 border-b border-gray-200">
        <div className="flex gap-2 items-center">
          <div className="flex gap-1.5 items-center">
            <Icon
              icon="material-symbols:grid-view"
              className="font-base text-gray-400"
            />
            <span className="font-medium">Page 1</span>
          </div>
          <Icon
            icon="material-symbols:chevron-right"
            className="text-xs text-gray-400"
          />
          <div className="flex gap-1.5 items-center">
            <Icon
              icon="material-symbols:desktop-windows-outline"
              className="font-base text-gray-400"
            />
            <span className="font-medium">1280-</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <Icon
              icon="material-symbols:chevron-right"
              className="text-xs text-gray-400"
            />
            <span className="font-medium">HeroSection</span>
          </div>
        </div>
      </div>
      <ResponsiveSection />
      <InstanceEdit />
    </div>
  );
});

const ResponsiveSection: React.FC = observer(() => {
  const artboardWidth = sameOrMixed(
    state.targets.map((t) => t.responsiveArtboard?.width)
  );

  return (
    <div className="px-4 py-3 flex flex-col gap-3 border-b border-gray-200">
      <h2 className="font-semibold">Responsive</h2>
      {artboardWidth === undefined ? (
        <Button
          onClick={() => {
            void rpc.remote.makeCurrentArtboardResponsive();
          }}
        >
          Make Current Frame Responsive
        </Button>
      ) : (
        <div className="flex">
          {breakpoints.map((size, i) => {
            if (typeof artboardWidth !== "number") {
              return null;
            }

            const matches = size.width <= artboardWidth;

            let exactIndex = 0;
            for (const [i, breakpoint] of breakpoints.entries()) {
              if (breakpoint.width > artboardWidth) {
                break;
              }
              exactIndex = i;
            }

            const onClick = () => {
              if (size.width === 0) {
                // mobile
                void rpc.remote.resizeCurrentArtboardWidth(375);
              } else {
                void rpc.remote.resizeCurrentArtboardWidth(size.width);
              }
            };

            return (
              <Tooltip text={`${size.label} - ${size.width}px`}>
                <button
                  onClick={onClick}
                  className={clsx("p-1 text-base", {
                    "bg-gray-100": matches,
                    "text-gray-300": !matches,
                    "font-bold text-gray-900": exactIndex === i,
                    "text-gray-500": exactIndex !== i,
                  })}
                >
                  {size.icon}
                </button>
              </Tooltip>
            );
          })}
        </div>
      )}
      {/* {state.targets.length ? (
    <Button
      onClick={() => {
        void rpc.remote.syncResponsiveContents();
      }}
    >
      <Icon className="text-xs" icon="material-symbols:sync-outline" />
      Sync Contents
    </Button>
  ) : (
    <Button
      onClick={() => {
        void rpc.remote.createResponsivePage();
      }}
    >
      <Icon icon="material-symbols:add" className="text-xs" />
      Create Responsive Page
    </Button>
  )} */}
    </div>
  );
});
