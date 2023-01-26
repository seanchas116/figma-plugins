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

function setPerBreakpointStyles(node: SceneNode, breakpointIndex: number) {
  if ("fontSize" in node && node.fontSize !== figma.mixed) {
    const fontSize = node.fontSize;

    const styleData = getPerBreakpointStylesData(node) ?? [
      { fontSize },
      { fontSize },
      { fontSize },
      { fontSize },
    ];
    styleData[breakpointIndex].fontSize = fontSize;
    setPerBreakpointStylesData(node, styleData);
    console.log(node, styleData);
  }

  if ("children" in node) {
    for (const child of node.children) {
      setPerBreakpointStyles(child, breakpointIndex);
    }
  }
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

      setPerBreakpointStyles(artboard, getBreakpointIndex(artboard.width));
    }
  }
};

figma.on("documentchange", onDocumentChange);
