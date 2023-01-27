import { ResponsiveArtboardInfo } from "../../types/data";
import {
  getPerBreakpointStylesData,
  getResponsiveArtboardData,
  PerBreakpointStyle,
  ResponsiveArtboardData,
  setPerBreakpointStylesData,
  setResponsiveArtboardData,
} from "../pluginData";

function getPerBreakpointStyle(node: SceneNode): PerBreakpointStyle {
  let fontSize = node.type === "TEXT" ? node.getRangeFontSize(0, 1) : undefined;
  if (fontSize === figma.mixed) {
    fontSize = undefined;
  }
  const layoutMode = "layoutMode" in node ? node.layoutMode : undefined;
  return {
    fontSize,
    layoutMode,
  };
}

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
    topLevelNode.setRelaunchData({
      open: "",
    });

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

  getPerBreakpointStylesData(
    node: SceneNode,
    defaultStyle: PerBreakpointStyle = getPerBreakpointStyle(node)
  ): PerBreakpointStyle[] {
    const styles: PerBreakpointStyle[] = [];
    for (let i = 0; i < this.breakpoints.length; i++) {
      styles.push({ ...defaultStyle });
    }

    const data = getPerBreakpointStylesData(node);

    for (const [minWidth, styleToLoad] of Object.entries(data ?? {})) {
      const index = this.breakpoints.findIndex(
        (breakpoint) => breakpoint.width === Number(minWidth)
      );
      if (0 <= index) {
        Object.assign(styles[index], styleToLoad);
      }
    }

    return styles;
  }

  setPerBreakpointStylesData(node: SceneNode, styles: PerBreakpointStyle[]) {
    const data: Record<number, PerBreakpointStyle> = {};
    for (let i = 0; i < styles.length; ++i) {
      data[this.breakpoints[i].width] = styles[i];
    }

    setPerBreakpointStylesData(node, data);
    node.setRelaunchData({
      open: "",
    });
  }

  setPerBreakpointStyles(
    breakpointIndex: number = this.getBreakpointIndex(),
    node: SceneNode = this.node
  ) {
    const currentStyle = getPerBreakpointStyle(node);

    const styleData = this.getPerBreakpointStylesData(node, currentStyle);
    console.log(styleData);

    styleData[breakpointIndex] = currentStyle;
    this.setPerBreakpointStylesData(node, styleData);
    node.setRelaunchData({
      open: "",
    });

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
    const stylesData = this.getPerBreakpointStylesData(node);
    const style = stylesData[breakpointIndex];
    console.log(style);

    if ("fontSize" in node && style.fontSize) {
      node.fontSize = style.fontSize;
    }
    if ("layoutMode" in node && style.layoutMode) {
      node.layoutMode = style.layoutMode;
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
    const styleData = this.getPerBreakpointStylesData(node);
    const breakpointIndex = this.getBreakpointIndex();
    for (let i = 0; i < breakpointIndex; i++) {
      styleData[i].fontSize = styleData[breakpointIndex].fontSize;
    }
    this.setPerBreakpointStylesData(node, styleData);

    if ("children" in node) {
      for (const child of node.children) {
        this.copyStylesToSmallerBreakpoints(child);
      }
    }
  }

  copyStylesToLargerBreakpoints(node: SceneNode) {
    const styleData = this.getPerBreakpointStylesData(node);
    const breakpointIndex = this.getBreakpointIndex();
    for (let i = breakpointIndex + 1; i < styleData.length; i++) {
      styleData[i].fontSize = styleData[breakpointIndex].fontSize;
    }
    this.setPerBreakpointStylesData(node, styleData);

    if ("children" in node) {
      for (const child of node.children) {
        this.copyStylesToLargerBreakpoints(child);
      }
    }
  }

  clear() {
    setResponsiveArtboardData(this.node, undefined);
    this.node.setRelaunchData({});
    this.clearPerBreakpointStyles(this.node);
  }

  private clearPerBreakpointStyles(node: SceneNode) {
    setPerBreakpointStylesData(node, undefined);
    node.setRelaunchData({});
    if ("children" in node) {
      for (const child of node.children) {
        this.clearPerBreakpointStyles(child);
      }
    }
  }
}
