import { ResponsiveArtboard } from "./ResponsiveArtboard";

const onDocumentChange = (event: DocumentChangeEvent) => {
  const resizedArtboards = new Map<string, ResponsiveArtboard>();

  for (const change of event.documentChanges) {
    if (
      change.type === "PROPERTY_CHANGE" &&
      change.properties.includes("width")
    ) {
      const node = change.node;
      if (node.removed) {
        continue;
      }
      const artboard = ResponsiveArtboard.get(node);
      if (!artboard || node !== artboard.node) {
        continue;
      }
      resizedArtboards.set(artboard.node.id, artboard);
    }
  }

  for (const artboard of resizedArtboards.values()) {
    artboard.restorePerBreakpointStyles();
  }

  const changedArtboards = new Map<string, ResponsiveArtboard>();

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

      changedArtboards.set(artboard.node.id, artboard);
    }
  }

  for (const artboard of changedArtboards.values()) {
    artboard.savePerBreakpointStyles();
  }
};

figma.on("documentchange", onDocumentChange);
