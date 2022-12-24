import { createRef, useEffect, useMemo } from "react";
import type { Node } from "figma-api/lib/ast-types";
import { InspectorState } from "./InspectorState";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import { Vec2 } from "paintvec";

const NodeHitBox: React.FC<{
  state: InspectorState;
  node: Node;
  offsetX: number;
  offsetY: number;
}> = observer(({ state, node, offsetX, offsetY }) => {
  if (!("absoluteBoundingBox" in node)) {
    return null;
  }
  if (node.visible === false) {
    return null;
  }

  const bbox = node.absoluteBoundingBox;

  const nodeState = state.getNodeState(node);
  const hovered = nodeState.isHovered;

  return (
    <>
      <div
        data-nodeid={node.id}
        className={clsx("absolute", {
          "ring-1 ring-red-500": hovered,
        })}
        style={{
          left: bbox.x - offsetX + "px",
          top: bbox.y - offsetY + "px",
          width: bbox.width + "px",
          height: bbox.height + "px",
        }}
      >
        {"children" in node &&
          node.children.map((child) => {
            return (
              <NodeHitBox
                key={child.id}
                state={state}
                node={child}
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
  state: InspectorState;
  node: Node;
  depth: number;
}> = observer(({ state, node, depth }) => {
  const nodeState = state.getNodeState(node);
  const hovered = nodeState.isHovered;

  return (
    <>
      <div
        className={clsx("h-6 flex items-center gap-2", {
          "bg-gray-200": hovered,
        })}
        style={{
          paddingLeft: depth * 12 + "px",
        }}
        onMouseEnter={action(() => {
          state.hoveredNodeID = node.id;
        })}
        onMouseLeave={action(() => {
          state.hoveredNodeID = undefined;
        })}
      >
        <div className="w-4 h-4 bg-gray-300" />
        <div className="flex-1">{node.name}</div>
      </div>
      {"children" in node &&
        node.children.map((child) => {
          return (
            <TreeItem
              key={child.id}
              state={state}
              node={child}
              depth={depth + 1}
            />
          );
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
        {state.artboards.map(({ node, screenshotSVG }) => {
          if (!("absoluteBoundingBox" in node)) {
            return null;
          }
          const rect = node.absoluteBoundingBox;

          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={node.name}
              key={node.id}
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
        >
          {state.artboards.map(({ node }) => {
            return (
              <NodeHitBox
                key={node.id}
                state={state}
                node={node}
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
}> = observer(({ fileID }) => {
  const state = useMemo(() => new InspectorState(fileID), [fileID]);

  return (
    <section className="flex flex-col h-screen w-screen font-xs">
      <div className="flex-1 flex">
        <div className="w-[256px] p-2 flex flex-col gap-2">
          <dl>
            <dt>Figma Access Token</dt>
            <dd>
              <input
                type="password"
                className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
                value={state.accessToken}
                onChange={action((event) => {
                  state.accessToken = event.currentTarget.value;
                })}
              />
            </dd>
          </dl>
          <button
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-fit"
            onClick={action(() => state.fetchFigma())}
          >
            Refresh
          </button>
          <div className="relative overflow-scroll flex-1 contain-strict">
            <div className="absolute left-0 top-0 w-max">
              {state.artboards.map(({ node }) => {
                return (
                  <TreeItem key={node.id} state={state} node={node} depth={0} />
                );
              })}
            </div>
          </div>
        </div>
        <Viewport state={state} />
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
        {JSON.stringify(state.document, null, 2)}
      </pre>
    </section>
  );
});
