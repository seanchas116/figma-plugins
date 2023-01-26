import {
  getPerBreakpointStylesData,
  setPerBreakpointStylesData,
} from "../pluginData";

export const breakpoints = [
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

export function getBreakpointIndex(width: number): number {
  let index = 0;
  for (const [i, breakpoint] of breakpoints.entries()) {
    if (width < breakpoint.width) {
      break;
    }
    index = i;
  }
  return index;
}

export function setPerBreakpointStyles(
  node: SceneNode,
  breakpointIndex: number
) {
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
