import React, { createRef, useEffect, useState } from "react";
import { iconData } from "../../state/IconData";
import { observer } from "mobx-react-lite";
import { DropMetadata } from "../../../types/data";
import { Tooltip } from "../../components/Tooltip";

const gridSize = 40;
const gridIconSize = 24;
const gridPadding = 8;

type IconCollectionGridElement = {
  x: number;
  y: number;
  name: string;
};

export const IconCollectionGrid: React.FC<{
  names: string[];
}> = observer(({ names }) => {
  const ref = createRef<HTMLDivElement>();

  const [height, setHeight] = useState(0);
  const [elements, setElements] = useState<IconCollectionGridElement[]>([]);

  useEffect(() => {
    const elem = ref.current;
    if (!elem) {
      return;
    }

    const onResizeOrScroll = () => {
      const width = elem.clientWidth - gridPadding * 2;
      const cols = Math.floor(width / gridSize);
      const rows = Math.ceil(names.length / cols);
      const height = rows * gridSize;

      const scrollTop = elem.scrollTop - gridPadding;
      const topRow = Math.floor(scrollTop / gridSize);
      const bottomRow = Math.ceil((scrollTop + elem.clientHeight) / gridSize);

      const elements: IconCollectionGridElement[] = [];

      for (let row = topRow; row < bottomRow; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * gridSize;
          const y = row * gridSize;
          const i = row * cols + col;
          const name = names[i];
          if (name) {
            elements.push({ x: x + gridPadding, y: y + gridPadding, name });
          }
        }
      }

      void iconData.fetchIcons(elements.map((e) => e.name));

      setHeight(height + 2 * gridPadding);
      setElements(elements);
    };

    onResizeOrScroll();
    elem.addEventListener("scroll", onResizeOrScroll);
    window.addEventListener("resize", onResizeOrScroll);
    return () => {
      elem.removeEventListener("scroll", onResizeOrScroll);
      window.removeEventListener("resize", onResizeOrScroll);
    };
  }, [names]);

  return (
    <div
      ref={ref}
      className="flex-1 relative min-h-0 overflow-y-scroll text-base text-gray-700"
    >
      <div
        style={{
          width: "100%",
          height: height + "px",
        }}
      >
        {elements.map(({ x, y, name }) => {
          const icon = iconData.icons.get(name);

          if (icon) {
            const onDragEnd = (e: React.DragEvent) => {
              // Don't proceed if the item was dropped inside the plugin window.
              // @ts-ignore
              if (e.view.length === 0) return;

              const file = new File(
                [e.currentTarget.innerHTML],
                "content.svg",
                {
                  type: "image/svg+xml",
                }
              );

              const dropMetadata: DropMetadata = {
                type: "icon",
                name,
              };

              // This will trigger a drop event in Figma that we can register a callback for
              window.parent.postMessage(
                {
                  pluginDrop: {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    files: [file],
                    dropMetadata,
                  },
                },
                "*"
              );
            };

            return (
              <Tooltip text={name}>
                <div
                  className="absolute hover:bg-gray-100 rounded flex items-center justify-center"
                  style={{
                    left: x + "px",
                    top: y + "px",
                    width: gridSize + "px",
                    height: gridSize + "px",
                  }}
                  draggable
                  onDragEnd={onDragEnd}
                >
                  <svg
                    key={name}
                    width={gridIconSize}
                    height={gridIconSize}
                    viewBox={`0 0 ${icon.width ?? 24} ${icon.width ?? 24}`}
                    dangerouslySetInnerHTML={{
                      __html: icon.body,
                    }}
                  />
                </div>
              </Tooltip>
            );
          }
        })}
      </div>
    </div>
  );
});
