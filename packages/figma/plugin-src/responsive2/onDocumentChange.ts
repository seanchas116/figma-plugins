import {
  getPerBreakpointStylesData,
  getResponsiveArtboardData,
  setPerBreakpointStylesData,
} from "../pluginData";
import { getArtboard } from "./getArtboard";

const breakpoints = [
  {
    width: 0,
    label: "SM",
  },
  {
    width: 768,
    label: "MD",
  },
  {
    width: 1024,
    label: "LG",
  },
  {
    width: 1280,
    label: "XL",
  },
] as const;

function getBreakpointIndex(width: number): number {
  let index = 0;
  for (const [i, breakpoint] of breakpoints.entries()) {
    if (width < breakpoint.width) {
      break;
    }
    index = i;
  }
  return index;
}

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

      if (!("fontSize" in node)) {
        continue;
      }
      if (node.fontSize === figma.mixed) {
        continue;
      }

      const breakpointIndex = getBreakpointIndex(artboard.width);

      const styleData = getPerBreakpointStylesData(node) ?? [{}, {}, {}, {}];
      styleData[breakpointIndex].fontSize = node.fontSize;
      setPerBreakpointStylesData(node, styleData);

      console.log(styleData);

      //console.log("fontSize changed", node, artboard);
    }
  }
};

figma.on("documentchange", onDocumentChange);
