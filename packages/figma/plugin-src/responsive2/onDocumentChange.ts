import { ResponsiveArtboard } from "./ResponsiveArtboard";

const onDocumentChange = (event: DocumentChangeEvent) => {
  const resizedArtboards = new Map<string, ResponsiveArtboard>();

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

      artboard.savePerBreakpointStyles();
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
      resizedArtboards.set(artboard.node.id, artboard);
    }
  }

  for (const artboard of resizedArtboards.values()) {
    artboard.restorePerBreakpointStyles();
  }
};

figma.on("documentchange", onDocumentChange);
