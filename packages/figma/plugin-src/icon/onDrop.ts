import { DropMetadata } from "../../types/data";
import { createNodeFromIcon } from "./insertIcon";

// @ts-ignore
figma.on("drop", (event: DropEvent) => {
  const { files, node, dropMetadata } = event;
  const iconDropMetadata = dropMetadata as DropMetadata;
  const icon = iconDropMetadata.icon;

  if (files.length > 0 && files[0].type === "image/svg+xml") {
    void files[0].getTextAsync().then((text) => {
      const newNode = createNodeFromIcon(text, icon);

      if (node.type !== "DOCUMENT" && "appendChild" in node) {
        node.appendChild(newNode);
      }
      newNode.x = event.x;
      newNode.y = event.y;

      figma.currentPage.selection = [newNode];

      figma.notify(`Inserted ${icon.name}`);
    });

    return false;
  }
});
