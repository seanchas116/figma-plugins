import "./codeImport/onDocumentChange";
//import "./responsive/onDocumentChange";
import "./onSelectionChange";
import "./rpc";

figma.showUI(__html__, { width: 240, height: 240 });

// Receive the drop event from the UI
// @ts-ignore
figma.on("drop", (event: DropEvent) => {
  console.log(event);

  const { files, node, dropMetadata } = event;
  const iconifyName = dropMetadata.iconify;

  if (files.length > 0 && files[0].type === "image/svg+xml") {
    files[0].getTextAsync().then((text) => {
      const newNode = figma.createNodeFromSvg(text);

      if (node.type !== "DOCUMENT" && "appendChild" in node) {
        node.appendChild(newNode);
      }

      newNode.name = iconifyName;
      newNode.x = event.x;
      newNode.y = event.y;

      figma.currentPage.selection = [newNode];
    });

    return false;
  }
});
