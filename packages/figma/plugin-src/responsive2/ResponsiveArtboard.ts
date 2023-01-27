import { ResponsiveArtboardInfo } from "../../types/data";
import {
  getPerBreakpointStylesData,
  getResponsiveArtboardData,
  ResponsiveArtboardData,
  setPerBreakpointStylesData,
  setResponsiveArtboardData,
} from "../pluginData";

export function getTopLevelNode(
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

  return getTopLevelNode(parent);
}

export class ResponsiveArtboard {
  static get(node: SceneNode): ResponsiveArtboard | undefined {
    const topLevelNode = getTopLevelNode(node);
    if (!topLevelNode) {
      return;
    }
    const data = getResponsiveArtboardData(topLevelNode);
    if (!data) {
      return;
    }

    return new ResponsiveArtboard(topLevelNode, data);
  }

  static attach(topLevelNode: FrameNode | ComponentNode): ResponsiveArtboard {
    const existing = ResponsiveArtboard.get(topLevelNode);
    if (existing) {
      return existing;
    }

    const data: ResponsiveArtboardData = {};
    setResponsiveArtboardData(topLevelNode, data);

    const artboard = new ResponsiveArtboard(topLevelNode, data);
    artboard.setPerBreakpointStyles(0);
    return artboard;
  }

  private constructor(
    node: FrameNode | ComponentNode,
    data: ResponsiveArtboardData
  ) {
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

  getBreakpointIndex(): number {
    let index = 0;
    for (const [i, breakpoint] of this.breakpoints.entries()) {
      if (this.node.width < breakpoint.width) {
        break;
      }
      index = i;
    }
    return index;
  }

  setPerBreakpointStyles(
    breakpointIndex: number = this.getBreakpointIndex(),
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

      styleData[breakpointIndex].fontSize = fontSize;
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
    breakpointIndex: number = this.getBreakpointIndex(),
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

  copyStylesToSmallerBreakpoints(node: SceneNode) {
    const styleData = getPerBreakpointStylesData(node);
    if (styleData) {
      const breakpointIndex = this.getBreakpointIndex();
      for (let i = 0; i < breakpointIndex; i++) {
        styleData[i].fontSize = styleData[breakpointIndex].fontSize;
      }
      setPerBreakpointStylesData(node, styleData);
    }
    if ("children" in node) {
      for (const child of node.children) {
        this.copyStylesToSmallerBreakpoints(child);
      }
    }
  }

  copyStylesToLargerBreakpoints(node: SceneNode) {
    const styleData = getPerBreakpointStylesData(node);
    if (styleData) {
      const breakpointIndex = this.getBreakpointIndex();
      for (let i = breakpointIndex + 1; i < styleData.length; i++) {
        styleData[i].fontSize = styleData[breakpointIndex].fontSize;
      }
      setPerBreakpointStylesData(node, styleData);
    }
    if ("children" in node) {
      for (const child of node.children) {
        this.copyStylesToLargerBreakpoints(child);
      }
    }
  }
}
