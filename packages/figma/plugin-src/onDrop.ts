import { DropMetadata } from "../types/data";
import { setIconPluginData } from "./pluginData";

// @ts-ignore
figma.on("drop", (event: DropEvent) => {
  console.log(event);

  const { files, node, dropMetadata } = event;
  const iconDropMetadata = dropMetadata as DropMetadata;

  if (files.length > 0 && files[0].type === "image/svg+xml") {
    files[0].getTextAsync().then((text) => {
      const newNode = figma.createNodeFromSvg(text);

      if (node.type !== "DOCUMENT" && "appendChild" in node) {
        node.appendChild(newNode);
      }

      for (const child of newNode.children) {
        child.locked = true;
      }

      setIconPluginData(newNode, {
        version: 1,
        source: "iconify",
        name: iconDropMetadata.name,
      });
      newNode.name = iconDropMetadata.name;
      newNode.x = event.x;
      newNode.y = event.y;

      figma.currentPage.selection = [newNode];
    });

    return false;
  }
});
