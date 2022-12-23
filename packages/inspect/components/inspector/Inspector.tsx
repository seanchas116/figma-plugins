import { createRef, useEffect, useMemo } from "react";
import type { Node } from "figma-api/lib/ast-types";
import { InspectorState } from "./InspectorState";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import { Vec2 } from "paintvec";

function renderFigmaNode(
  state: InspectorState,
  node: Node,
  offset: { x: number; y: number }
): JSX.Element | null {
  if (!("absoluteBoundingBox" in node)) {
    return null;
  }
  const bbox = node.absoluteBoundingBox;

  const hovered = state.hoveredNode === node;

  return (
    <>
      <div
        className={clsx("absolute", {
          "ring-1 ring-red-500": hovered,
        })}
        style={{
          left: bbox.x - offset.x + "px",
          top: bbox.y - offset.y + "px",
          width: bbox.width + "px",
          height: bbox.height + "px",
        }}
        onMouseEnter={action(() => {
          state.hoveredNode = node;
        })}
        onMouseLeave={action(() => {
          state.hoveredNode = undefined;
        })}
      >
        {"children" in node &&
          node.children.map((child) => {
            return renderFigmaNode(state, child, {
              x: bbox.x,
              y: bbox.y,
            });
          })}
      </div>
    </>
  );
}

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
      className="relative w-full h-[640px] bg-gray-300 border border-gray-500 overflow-hidden"
    >
      <div
        style={{
          transformOrigin: "left top",
          transform: `translate(${state.scroll.x}px, ${state.scroll.y}px)`,
        }}
      >
        {state.rootNodes.map((node) => {
          const rect = (node.node as Node<"FRAME">).absoluteBoundingBox;

          return (
            <img
              key={node.node.id}
              style={{
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
              src={node.screenshotSVG}
            />
          );
        })}

        {state.rootNodes.map((node) => {
          return renderFigmaNode(state, node.node, {
            x: 0,
            y: 0,
          });
        })}
      </div>
    </div>
  );
});

export const Inspector: React.FC = observer(() => {
  const state = useMemo(() => new InspectorState(), []);

  return (
    <section className="flex flex-col gap-2 p-2">
      <dl>
        <dt>Figma Access Token</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            value={state.accessToken}
            onChange={action((event) => {
              state.accessToken = event.currentTarget.value;
            })}
          />
        </dd>
        <dt>File URL</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            value={state.fileURL}
            onChange={action((event) => {
              state.fileURL = event.currentTarget.value;
            })}
          />
        </dd>
      </dl>
      <button
        className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-fit"
        onClick={action(() => state.fetchFigma())}
      >
        Fetch
      </button>
      <Viewport state={state} />
      <pre
        className="
        text-xs
        bg-gray-100
        border border-gray-300
        rounded-md
        p-2
        whitespace-pre-wrap
        "
      >
        {JSON.stringify(state.document, null, 2)}
      </pre>
    </section>
  );
});
