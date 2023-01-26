import { getResponsiveArtboardData } from "../pluginData";
import { getArtboard } from "./getArtboard";
import {
  getBreakpointIndex,
  restorePerBreakpointStyles,
  setPerBreakpointStyles,
} from "./setPerBreakpointStyles";

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

      setPerBreakpointStyles(artboard, getBreakpointIndex(artboard.width));
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
      const artboardData = getResponsiveArtboardData(node);
      if (!artboardData) {
        continue;
      }

      const breakpointIndex = getBreakpointIndex(node.width);
      void restorePerBreakpointStyles(node, breakpointIndex);
    }
  }
};

figma.on("documentchange", onDocumentChange);
