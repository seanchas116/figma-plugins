import { ResponsiveArtboard } from "./ResponsiveArtboard";

const onDocumentChange = (event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    if (
      change.type === "PROPERTY_CHANGE" &&
      (change.properties.includes("fontSize") ||
        change.properties.includes("layoutMode"))
    ) {
      const node = change.node;
      if (node.removed) {
        continue;
      }
      const artboard = ResponsiveArtboard.get(node);
      if (!artboard) {
        continue;
      }

      artboard.setPerBreakpointStyles();
    }

    // artboard resized
    if (
      change.type === "PROPERTY_CHANGE" &&
      change.properties.includes("width")
    ) {
      const node = change.node;
      if (node.removed) {
        continue;
      }
      const artboard = ResponsiveArtboard.get(node);
      if (!artboard) {
        continue;
      }
      artboard.restorePerBreakpointStyles();
    }
  }
};

figma.on("documentchange", onDocumentChange);
