import { observedProperties } from "./PerBreakpointStyle";
import { ResponsiveArtboard } from "./ResponsiveArtboard";

let lastRestoreTime = 0;

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
      if (!artboard || node !== artboard.root) {
        continue;
      }
      resizedArtboards.set(artboard.root.id, artboard);
    }
  }

  if (resizedArtboards.size) {
    for (const artboard of resizedArtboards.values()) {
      artboard.restorePerBreakpointStyles();
    }
    lastRestoreTime = Date.now();
    return;
  }

  if (Date.now() - lastRestoreTime < 1000) {
    return;
  }

  const changedArtboards = new Map<string, ResponsiveArtboard>();

  for (const change of event.documentChanges) {
    if (
      change.type === "PROPERTY_CHANGE" &&
      change.properties.some((p) => observedProperties.has(p))
    ) {
      const node = change.node;
      if (node.removed) {
        continue;
      }
      const artboard = ResponsiveArtboard.get(node);
      if (!artboard) {
        continue;
      }

      changedArtboards.set(artboard.root.id, artboard);
    }
  }

  for (const artboard of changedArtboards.values()) {
    artboard.savePerBreakpointStyles();
  }
};

figma.on("documentchange", onDocumentChange);
