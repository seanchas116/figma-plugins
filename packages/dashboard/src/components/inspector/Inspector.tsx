import { createRef, useEffect, useMemo } from "react";
import { InspectorState, NodeState } from "./InspectorState";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import { Vec2 } from "paintvec";

const NodeHitBox: React.FC<{
  nodeState: NodeState;
  offsetX: number;
  offsetY: number;
}> = observer(({ nodeState, offsetX, offsetY }) => {
  const node = nodeState.node;

  if (!("absoluteBoundingBox" in node)) {
    return null;
  }
  if (node.visible === false) {
    return null;
  }

  const bbox = node.absoluteBoundingBox;

  const hovered = nodeState.hovered;
  const selected = nodeState.selected;

  return (
    <>
      <div
        data-nodeid={node.id}
        className={clsx("absolute", {
          "ring-1 ring-red-500": hovered || selected,
        })}
        style={{
          left: bbox.x - offsetX + "px",
          top: bbox.y - offsetY + "px",
          width: bbox.width + "px",
          height: bbox.height + "px",
        }}
      >
        {nodeState.childStates.map((child) => {
          return (
            <NodeHitBox
              key={child.id}
              nodeState={child}
              offsetX={bbox.x}
              offsetY={bbox.y}
            />
          );
        })}
      </div>
    </>
  );
});

const TreeItem: React.FC<{
  nodeState: NodeState;
  depth: number;
}> = observer(({ nodeState, depth }) => {
  const { node, hovered, selected, ancestorSelected } = nodeState;

  return (
    <>
      <div
        className={clsx("h-6 flex items-center gap-2", {
          "bg-gray-200": hovered && !selected,
          "bg-blue-500 text-white": selected,
          "bg-blue-100": ancestorSelected && !selected,
        })}
        style={{
          paddingLeft: `${depth * 12 + 8}px`,
        }}
        onMouseEnter={action(() => {
          nodeState.inspectorState.hoveredNodeID = node.id;
        })}
        onMouseLeave={action(() => {
          nodeState.inspectorState.hoveredNodeID = undefined;
        })}
        onMouseDown={action((event: React.MouseEvent) => {
          if (event.button === 0) {
            if (!event.shiftKey && !event.metaKey) {
              nodeState.inspectorState.deselectAll();
            }
            nodeState.select();
          }
        })}
      >
        <div className="w-4 h-4 bg-gray-300" />
        <div className="flex-1">{node.name}</div>
      </div>
      {nodeState.childStates.map((child) => {
        return <TreeItem key={child.id} nodeState={child} depth={depth + 1} />;
      })}
    </>
  );
});

const Viewport: React.FC<{ state: InspectorState }> = observer(({ state }) => {
  const ref = createRef<HTMLDivElement>();
  useEffect(() => {
    const onWheel = action((event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      state.scroll = state.scroll.sub(new Vec2(event.deltaX, event.deltaY));
    });

    const element = ref.current;
    if (element) {
      element.addEventListener("wheel", onWheel);
      return () => {
        element.removeEventListener("wheel", onWheel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full flex-1 bg-gray-300 overflow-hidden contain-strict"
    >
      <div
        style={{
          transformOrigin: "left top",
          transform: `translate(${state.scroll.x}px, ${state.scroll.y}px)`,
        }}
      >
        {state.artboards.map(({ nodeState, screenshotSVG }) => {
          if (!("absoluteBoundingBox" in nodeState.node)) {
            return null;
          }
          const rect = nodeState.node.absoluteBoundingBox;

          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={nodeState.node.name}
              key={nodeState.node.id}
              style={{
                willChange: "transform",
                pointerEvents: "none",
                maxWidth: "unset",
                position: "absolute",
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
              }}
              width={rect.width}
              height={rect.height}
              src={screenshotSVG}
            />
          );
        })}

        <div
          onMouseMove={action((e) => {
            if (e.target instanceof HTMLElement && e.target.dataset.nodeid) {
              state.hoveredNodeID = e.target.dataset.nodeid;
            }
          })}
          onMouseLeave={action(() => {
            state.hoveredNodeID = undefined;
          })}
          onMouseDown={action((e) => {
            if (e.target instanceof HTMLElement && e.target.dataset.nodeid) {
              if (e.button === 0) {
                if (!e.shiftKey && !e.metaKey) {
                  state.deselectAll();
                }
                const nodeState = state.getNodeState(e.target.dataset.nodeid);
                nodeState.select();
              }
            }
          })}
        >
          {state.artboards.map(({ nodeState }) => {
            return (
              <NodeHitBox
                key={nodeState.id}
                nodeState={nodeState}
                offsetX={0}
                offsetY={0}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

export const Inspector: React.FC<{
  fileID: string;
  accessToken: string;
}> = observer(({ fileID, accessToken }) => {
  const state = useMemo(
    () => new InspectorState(fileID, accessToken),
    [fileID, accessToken]
  );

  return (
    <section className="flex flex-col h-screen w-screen font-xs">
      <div className="flex-1 flex">
        <div className="w-[256px] flex flex-col">
          <div className="p-2">
            <button
              className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-fit"
              onClick={action(() => state.fetchFigma())}
            >
              Refresh
            </button>
          </div>
          <div className="relative overflow-scroll flex-1 contain-strict">
            <div className="absolute left-0 top-0 w-max">
              {state.artboards.map(({ nodeState }) => {
                return (
                  <TreeItem
                    key={nodeState.id}
                    nodeState={nodeState}
                    depth={0}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <Viewport state={state} />
      </div>
      <div>
        <select>
          <option>Figma JSON</option>
          <option>Intermediate</option>
          <optgroup label="React">
            <option>React + Tailwind</option>
          </optgroup>
        </select>
      </div>
      <pre
        className="
        h-[384px]
        text-xs
        bg-gray-100
        border-t border-gray-300
        p-2
        whitespace-pre-wrap
        overflow-scroll
        "
      >
        {JSON.stringify(
          state.selectedNodeStates.map((nodeState) => nodeState.node),
          null,
          2
        )}
      </pre>
    </section>
  );
});
