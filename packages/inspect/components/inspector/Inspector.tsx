import { useMemo } from "react";
import type { Node } from "figma-api/lib/ast-types";
import { InspectorState } from "./InspectorState";
import { action } from "mobx";
import { observer } from "mobx-react-lite";

function renderFigmaRectLikeNodes(
  node: Node<"FRAME"> | Node<"COMPONENT"> | Node<"INSTANCE"> | Node<"RECTANGLE">
): JSX.Element {
  let svgFill = "none";

  for (const fill of node.fills) {
    if (fill.type === "SOLID" && fill.color) {
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);
      const a = fill.opacity ?? 1;
      svgFill = `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    if (fill.type === "IMAGE" && fill.imageRef) {
      console.log(fill.imageRef);
    }
  }

  return (
    <>
      <rect
        x={node.absoluteBoundingBox.x}
        y={node.absoluteBoundingBox.y}
        width={node.absoluteBoundingBox.width}
        height={node.absoluteBoundingBox.height}
        fill={svgFill}
      />
      {"children" in node &&
        node.children.map((child) => {
          return renderFigmaNode(child);
        })}
    </>
  );
}

function renderFigmaNode(node: Node): JSX.Element | null {
  switch (node.type) {
    case "FRAME":
    case "COMPONENT":
    case "INSTANCE":
    case "RECTANGLE":
      return renderFigmaRectLikeNodes(node as any);
    case "CANVAS":
      return (
        <>
          {(node as Node<"CANVAS">).children.map((child) => {
            return renderFigmaNode(child);
          })}
        </>
      );
    default:
      return null;
  }
}

export const Inspector: React.FC = observer(() => {
  const state = useMemo(() => new InspectorState(), []);

  return (
    <section className="flex flex-col gap-2 p-2">
      <h1 className="text-2xl font-bold">Inspector</h1>
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
      <div className="relative w-[640px] h-[480px] bg-gray-300 overflow-hidden">
        {state.rootNodes.map((node) => {
          const rect = (node.node as Node<"FRAME">).absoluteBoundingBox;

          return (
            <img
              style={{
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
      </div>

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
