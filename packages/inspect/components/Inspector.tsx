import { useState } from "react";
import type { GetFileResult } from "figma-api/lib/api-types";
import type { Node } from "figma-api/lib/ast-types";

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

function fileIDFromFigmaFileURL(fileURL: string): string | undefined {
  const match = fileURL.match(/https:\/\/www.figma.com\/file\/([^\/]*)/);
  if (!match) {
    return undefined;
  }
  return match[1];
}

export const Inspector: React.FC = () => {
  const [data, setData] = useState<GetFileResult | undefined>(undefined);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("figmaAccessToken") ?? ""
  );
  const [fileURL, setFileURL] = useState(
    localStorage.getItem("figmaFileURL") ?? ""
  );

  const fetchFigma = async () => {
    const fileID = fileIDFromFigmaFileURL(fileURL);
    console.log(fileID);
    if (!fileID) {
      return;
    }
    const response = await (
      await fetch(`https://api.figma.com/v1/files/${fileID}`, {
        headers: {
          "X-Figma-Token": accessToken,
        },
      })
    ).json();
    setData(response);
  };

  return (
    <section className="flex flex-col gap-2 p-2">
      <h1 className="text-2xl font-bold">Inspector</h1>
      <dl>
        <dt>Figma Access Token</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            value={accessToken}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setAccessToken(value);
              localStorage.setItem("figmaAccessToken", value);
            }}
          />
        </dd>
        <dt>File URL</dt>
        <dd>
          <input
            className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
            value={fileURL}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setFileURL(value);
              localStorage.setItem("figmaFileURL", value);
            }}
          />
        </dd>
      </dl>
      <button
        className="border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-fit"
        onClick={fetchFigma}
      >
        Fetch
      </button>
      <svg className="w-[640px] h-[480px] bg-gray-300">
        {data && renderFigmaNode(data.document.children[0])}
      </svg>
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
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
};
