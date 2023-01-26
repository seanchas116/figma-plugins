import { getResponsiveArtboardData } from "../pluginData";
import { getArtboard } from "./getArtboard";

const onDocumentChange = (event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    if (
      change.type === "PROPERTY_CHANGE" &&
      change.properties.includes("fontSize")
    ) {
      const node = change.node;
      if (node.removed) {
        continue;
      }
      const artboard = getArtboard(node);
      if (!artboard) {
        continue;
      }
      const artboardData = getResponsiveArtboardData(artboard);
      if (!artboardData) {
        continue;
      }

      console.log("fontSize changed", node, artboard);
    }
  }
};

figma.on("documentchange", onDocumentChange);
