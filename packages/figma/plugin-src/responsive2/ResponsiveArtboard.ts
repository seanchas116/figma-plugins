import { ResponsiveArtboardInfo } from "../../types/data";
import {
  getPerBreakpointStylesData,
  getResponsiveArtboardData,
  ResponsiveArtboardData,
  setPerBreakpointStylesData,
  setResponsiveArtboardData,
} from "../pluginData";

// Get the top-level node (aka artboard)
export function getArtboard(
  node: SceneNode
): FrameNode | ComponentNode | undefined {
  const parent = node.parent;
  if (!parent || parent.type === "DOCUMENT") {
    return;
  }

  if (parent.type === "PAGE" || parent.type === "COMPONENT_SET") {
    if (node.type === "FRAME" || node.type === "COMPONENT") {
      return node;
    }
    return;
  }

  return getArtboard(parent);
}

export class ResponsiveArtboard {
  static get(node: SceneNode): ResponsiveArtboard | undefined {
    const artboardNode = getArtboard(node);
    if (!artboardNode) {
      return;
    }
    const data = getResponsiveArtboardData(artboardNode);
    if (!data) {
      return;
    }

    return new ResponsiveArtboard(artboardNode, data);
  }

  static attach(node: FrameNode | ComponentNode): ResponsiveArtboard {
    const existing = ResponsiveArtboard.get(node);
    if (existing) {
      return existing;
    }

    const data: ResponsiveArtboardData = {};
    setResponsiveArtboardData(node, data);

    const artboard = new ResponsiveArtboard(node, data);
    artboard.setPerBreakpointStyles(0);
    return artboard;
  }

  constructor(node: FrameNode | ComponentNode, data: ResponsiveArtboardData) {
    this.node = node;
    this.data = data;
  }

  readonly node: FrameNode | ComponentNode;
  readonly data: ResponsiveArtboardData;
  readonly breakpoints = [
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

  resize(width: number) {
    this.node.resize(width, this.node.height);
  }

  getBreakpointIndex(width: number): number {
    let index = 0;
    for (const [i, breakpoint] of this.breakpoints.entries()) {
      if (width < breakpoint.width) {
        break;
      }
      index = i;
    }
    return index;
  }

  setPerBreakpointStyles(
    breakpointIndex: number = this.getBreakpointIndex(this.node.width),
    node: SceneNode = this.node
  ) {
    if ("fontSize" in node && node.fontSize !== figma.mixed) {
      const fontSize = node.fontSize;

      const styleData = getPerBreakpointStylesData(node) ?? [
        { fontSize },
        { fontSize },
        { fontSize },
        { fontSize },
      ];

      // desktop first
      for (let i = 0; i <= breakpointIndex; i++) {
        styleData[i].fontSize = fontSize;
      }
      setPerBreakpointStylesData(node, styleData);
      console.log(node, styleData);
    }

    if ("children" in node) {
      for (const child of node.children) {
        this.setPerBreakpointStyles(breakpointIndex, child);
      }
    }
  }

  restorePerBreakpointStyles(
    breakpointIndex: number = this.getBreakpointIndex(this.node.width),
    node: SceneNode = this.node
  ): void {
    if ("fontSize" in node) {
      const styleData = getPerBreakpointStylesData(node);
      if (styleData) {
        // TODO: load font in appropriate timings
        //await figma.loadFontAsync(node.fontName as FontName);
        node.fontSize = styleData[breakpointIndex].fontSize;
      }
    }

    if ("children" in node) {
      for (const child of node.children) {
        this.restorePerBreakpointStyles(breakpointIndex, child);
      }
    }
  }

  getInfo(): ResponsiveArtboardInfo {
    return {
      width: this.node.width,
    };
  }
}
