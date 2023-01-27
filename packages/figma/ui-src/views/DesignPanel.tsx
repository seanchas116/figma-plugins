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
import { useState } from "react";

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

export const DesignPanel: React.FC = observer(() => {
  return (
    <div>
      {/* <div className="px-4 py-3 flex flex-col gap-3 border-b border-gray-200">
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
      </div> */}
      <ResponsiveSection />
      <InstanceEdit />
    </div>
  );
});

const ResponsiveSection: React.FC = observer(() => {
  const artboardWidth = sameOrMixed(
    state.targets.map((t) => t.responsiveArtboard?.width)
  );
  const hasResponsiveArtboard = artboardWidth !== undefined;

  return (
    <div className="px-4 py-3 flex flex-col gap-3 border-b border-gray-200">
      <h2 className="font-semibold flex items-center justify-between">
        Responsive
        {hasResponsiveArtboard && (
          <button
            className="text-base p-1 hover:bg-gray-100 rounded"
            onClick={() => {
              // TODO: confirm
              void rpc.remote.clearCurrentArtboardResponsive();
            }}
          >
            <Icon icon="material-symbols:remove" />
          </button>
        )}
      </h2>
      {!hasResponsiveArtboard ? (
        <Button
          onClick={() => {
            void rpc.remote.makeCurrentArtboardResponsive();
          }}
        >
          Make Current Frame Responsive
        </Button>
      ) : (
        <BreakpointSelect />
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

const BreakpointSelect: React.FC = observer(() => {
  const [copyToSmallerButtonHover, setCopyToSmallerButtonHover] =
    useState(false);
  const [copyToLargerButtonHover, setCopyToLargerButtonHover] = useState(false);

  const artboardWidth = sameOrMixed(
    state.targets.map((t) => t.responsiveArtboard?.width)
  );
  if (typeof artboardWidth !== "number") {
    return null;
  }
  const breakpointIndex = getBreakpointIndex(artboardWidth);

  return (
    <div className="flex gap-4">
      <div className="flex">
        {breakpoints.map((size, i) => {
          const onClick = () => {
            if (size.width === 0) {
              // mobile
              void rpc.remote.resizeCurrentArtboardWidth(375);
            } else {
              void rpc.remote.resizeCurrentArtboardWidth(size.width);
            }
          };

          const isCopyTarget = copyToSmallerButtonHover
            ? i < breakpointIndex
            : copyToLargerButtonHover
            ? i > breakpointIndex
            : false;

          return (
            <Tooltip text={`${size.label} - ${size.width}px`}>
              <button
                onMouseDown={onClick}
                className={clsx("p-1 text-base rounded hover:bg-gray-100", {
                  "text-blue-500": isCopyTarget,
                  // "bg-gray-100": i <= breakpointIndex,
                  // "text-gray-300": !(i <= breakpointIndex),
                  "font-bold bg-blue-500 hover:bg-blue-500 text-white":
                    breakpointIndex === i,
                  "text-gray-600": !isCopyTarget && breakpointIndex !== i,
                })}
              >
                {size.icon}
              </button>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex">
        <Tooltip text="Copy styles to smaller breakpoints">
          <button
            disabled={breakpointIndex === 0}
            className="text-base enabled:hover:bg-gray-100 p-1 rounded text-gray-500 disabled:text-gray-300"
            onMouseEnter={() => setCopyToSmallerButtonHover(true)}
            onMouseLeave={() => setCopyToSmallerButtonHover(false)}
            onClick={() => {
              void rpc.remote.copyStylesToSmallerScreens();
            }}
          >
            <Icon icon="material-symbols:assignment-return-outline" />
          </button>
        </Tooltip>
        <Tooltip text="Copy styles to larger breakpoints">
          <button
            disabled={breakpointIndex === breakpoints.length - 1}
            className="text-base enabled:hover:bg-gray-100 p-1 rounded text-gray-500 disabled:text-gray-300"
            onMouseEnter={() => setCopyToLargerButtonHover(true)}
            onMouseLeave={() => setCopyToLargerButtonHover(false)}
            onClick={() => {
              void rpc.remote.copyStylesToLargerScreens();
            }}
          >
            <Icon icon="material-symbols:assignment-return-outline" hFlip />
          </button>
        </Tooltip>
      </div>
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

function getBreakpointIndex(width: number): number {
  let index = 0;
  for (const [i, breakpoint] of breakpoints.entries()) {
    if (width < breakpoint.width) {
      break;
    }
    index = i;
  }
  return index;
}
