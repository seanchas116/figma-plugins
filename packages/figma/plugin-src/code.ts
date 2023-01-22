import { DropMetadata } from "../types/data";
import "./codeImport/onDocumentChange";
//import "./responsive/onDocumentChange";
import "./onSelectionChange";
import { setIconPluginData } from "./pluginData";
import "./rpc";

figma.showUI(__html__, { width: 240, height: 240 });

// Receive the drop event from the UI
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

      setIconPluginData(newNode, {
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
