import { state } from "../../state/State";
import { Tooltip } from "../../components/Tooltip";
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";
import { MIXED, sameOrMixed } from "../../util/Mixed";
import clsx from "clsx";
import { rpc } from "../../rpc";
import { Button } from "../../components/Button";

export const ResponsiveSection: React.FC = observer(() => {
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
  const artboardWidth = sameOrMixed(
    state.targets.map((t) => t.responsiveArtboard?.width)
  );
  if (typeof artboardWidth !== "number") {
    return null;
  }

  let modifiedBreakpoints = sameOrMixed(
    state.targets.map((t) => t.responsiveArtboard?.overriddenIndexes ?? [])
  );
  if (modifiedBreakpoints === undefined || modifiedBreakpoints === MIXED) {
    modifiedBreakpoints = [];
  }

  const breakpointIndex = getBreakpointIndex(artboardWidth);

  return (
    <div className="flex gap-4">
      <div className="flex">
        {Array(breakpoints.length + 1)
          .fill(0)
          .map((_, i) => {
            const onClick = () => {
              if (i === 0) {
                // mobile
                void rpc.remote.resizeCurrentArtboardWidth(375);
              } else {
                void rpc.remote.resizeCurrentArtboardWidth(
                  breakpoints[i - 1].width
                );
              }
            };

            const isCurrent = i === breakpointIndex;
            const isAffected = i <= breakpointIndex;

            const widthMin = i === 0 ? undefined : breakpoints[i - 1].width;
            const widthMax =
              i === breakpoints.length ? undefined : breakpoints[i].width - 1;

            let rangeText = "";
            if (widthMin !== undefined && widthMax !== undefined) {
              rangeText = `${widthMin} - ${widthMax}`;
            } else if (widthMin !== undefined) {
              rangeText = `${widthMin} -`;
            } else if (widthMax !== undefined) {
              rangeText = `- ${widthMax}`;
            }

            const modified = (modifiedBreakpoints as number[]).includes(i);

            return (
              <Tooltip text={rangeText}>
                <div
                  className={clsx({
                    "bg-gray-100": isAffected,
                    "rounded-l": i === 0,
                    "rounded-r": isCurrent,
                  })}
                >
                  <button
                    onMouseDown={onClick}
                    className={clsx("p-1 text-base relative", {
                      "rounded font-bold text-blue-500": isCurrent,
                      "text-gray-600 hover:text-gray-900": !isCurrent,
                    })}
                  >
                    {icons[i]}
                    {modified && (
                      <div className="absolute top-0.5 right-0.5 bg-orange-500 w-1 h-1 rounded-full" />
                    )}
                  </button>
                </div>
              </Tooltip>
            );
          })}
      </div>
      <div className="flex">
        <Tooltip text="Reset Override">
          <button
            disabled={breakpointIndex === breakpoints.length - 1}
            className="text-base enabled:hover:bg-gray-100 p-1 rounded text-gray-500 disabled:text-gray-300"
            onClick={() => {
              throw new Error("TODO");
            }}
          >
            <Icon icon="material-symbols:restart-alt" />
          </button>
        </Tooltip>
        <Tooltip text="Apply to Larger Screens">
          <button
            disabled={breakpointIndex === breakpoints.length - 1}
            className="text-base enabled:hover:bg-gray-100 p-1 rounded text-gray-500 disabled:text-gray-300"
            onClick={() => {
              throw new Error("TODO");
            }}
          >
            <Icon icon="material-symbols:assignment-return-outline" hFlip />
          </button>
        </Tooltip>
      </div>
    </div>
  );
});

const breakpoints = [{ width: 768 }, { width: 1024 }, { width: 1280 }] as const;

const icons = [
  <Icon icon="material-symbols:phone-iphone-outline" />,
  <Icon icon="material-symbols:tablet-mac-outline" />,
  <Icon icon="material-symbols:laptop-mac-outline" />,
  <Icon icon="material-symbols:desktop-mac-outline" />,
];

function getBreakpointIndex(width: number) {
  for (let i = 0; i < breakpoints.length; ++i) {
    if (width < breakpoints[i].width) {
      return i;
    }
  }
  return breakpoints.length;
}
