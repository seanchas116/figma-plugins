import { ResponsiveArtboardInfo } from "../../types/data";
import {
  getPerBreakpointStylesData,
  getResponsiveArtboardData,
  PerBreakpointStyle,
  ResponsiveArtboardData,
  setPerBreakpointStylesData,
  setResponsiveArtboardData,
} from "../pluginData";

function omitMixed<T>(value: T | typeof figma.mixed): T | undefined {
  return value === figma.mixed ? undefined : value;
}

// TODO: swap primaryAxisAlignItems and counterAxisAlignItems if layoutMode is changed

function getPerBreakpointStyle(node: SceneNode): PerBreakpointStyle {
  return {
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    ...("layoutAlign" in node
      ? {
          layoutAlign: node.layoutAlign,
          layoutGrow: node.layoutGrow,
          layoutPositioning: node.layoutPositioning,
        }
      : undefined),
    ...("layoutMode" in node
      ? {
          layoutMode: node.layoutMode,
          primaryAxisSizingMode: node.primaryAxisSizingMode,
          counterAxisSizingMode: node.counterAxisSizingMode,
          primaryAxisAlignItems: node.primaryAxisAlignItems,
          counterAxisAlignItems: node.counterAxisAlignItems,
          paddingLeft: node.paddingLeft,
          paddingRight: node.paddingRight,
          paddingTop: node.paddingTop,
          paddingBottom: node.paddingBottom,
          itemSpacing: node.itemSpacing,
          itemReverseZIndex: node.itemReverseZIndex,
          strokesIncludedInLayout: node.strokesIncludedInLayout,
        }
      : undefined),
    ...("fontSize" in node
      ? {
          fontSize: omitMixed(node.getRangeFontSize(0, 1)),
        }
      : undefined),
  };
}

function setPerBreakpointStyle(node: SceneNode, style: PerBreakpointStyle) {
  node.x = style.x;
  node.y = style.y;

  // TODO: resize

  if ("layoutAlign" in node) {
    if (style.layoutAlign !== undefined) {
      node.layoutAlign = style.layoutAlign;
    }
    if (style.layoutGrow !== undefined) {
      node.layoutGrow = style.layoutGrow;
    }
    if (style.layoutPositioning !== undefined) {
      node.layoutPositioning = style.layoutPositioning;
    }
  }

  if ("layoutMode" in node) {
    if (style.layoutMode !== undefined) {
      node.layoutMode = style.layoutMode;
    }
    if (style.primaryAxisSizingMode !== undefined) {
      node.primaryAxisSizingMode = style.primaryAxisSizingMode;
    }
    if (style.counterAxisSizingMode !== undefined) {
      node.counterAxisSizingMode = style.counterAxisSizingMode;
    }
    if (style.primaryAxisAlignItems !== undefined) {
      node.primaryAxisAlignItems = style.primaryAxisAlignItems;
    }
    if (style.counterAxisAlignItems !== undefined) {
      node.counterAxisAlignItems = style.counterAxisAlignItems;
    }
    if (style.paddingLeft !== undefined) {
      node.paddingLeft = style.paddingLeft;
    }
    if (style.paddingRight !== undefined) {
      node.paddingRight = style.paddingRight;
    }
    if (style.paddingTop !== undefined) {
      node.paddingTop = style.paddingTop;
    }
    if (style.paddingBottom !== undefined) {
      node.paddingBottom = style.paddingBottom;
    }
    if (style.itemSpacing !== undefined) {
      node.itemSpacing = style.itemSpacing;
    }
    if (style.itemReverseZIndex !== undefined) {
      node.itemReverseZIndex = style.itemReverseZIndex;
    }
    if (style.strokesIncludedInLayout !== undefined) {
      node.strokesIncludedInLayout = style.strokesIncludedInLayout;
    }
  }

  if ("fontSize" in node) {
    if (style.fontSize !== undefined) {
      node.fontSize = style.fontSize;
    }
  }
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
    artboard.savePerBreakpointStyles(0);
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

  private getPerBreakpointStyles(
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

  private setPerBreakpointStyles(
    node: SceneNode,
    styles: PerBreakpointStyle[]
  ) {
    const data: Record<number, PerBreakpointStyle> = {};
    for (let i = 0; i < styles.length; ++i) {
      data[this.breakpoints[i].width] = styles[i];
    }

    setPerBreakpointStylesData(node, data);
    node.setRelaunchData({
      open: "",
    });
  }

  savePerBreakpointStyles(
    breakpointIndex: number = this.getBreakpointIndex(),
    node: SceneNode = this.node
  ) {
    const currentStyle = getPerBreakpointStyle(node);

    const styleData = this.getPerBreakpointStyles(node, currentStyle);
    console.log(styleData);

    styleData[breakpointIndex] = currentStyle;
    this.setPerBreakpointStyles(node, styleData);
    node.setRelaunchData({
      open: "",
    });

    if ("children" in node) {
      for (const child of node.children) {
        this.savePerBreakpointStyles(breakpointIndex, child);
      }
    }
  }

  restorePerBreakpointStyles(
    breakpointIndex: number = this.getBreakpointIndex(),
    node: SceneNode = this.node
  ): void {
    const stylesData = this.getPerBreakpointStyles(node);
    const style = stylesData[breakpointIndex];
    console.log(style);

    setPerBreakpointStyle(node, style);

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
    const styleData = this.getPerBreakpointStyles(node);
    const breakpointIndex = this.getBreakpointIndex();
    for (let i = 0; i < breakpointIndex; i++) {
      styleData[i].fontSize = styleData[breakpointIndex].fontSize;
    }
    this.setPerBreakpointStyles(node, styleData);

    if ("children" in node) {
      for (const child of node.children) {
        this.copyStylesToSmallerBreakpoints(child);
      }
    }
  }

  copyStylesToLargerBreakpoints(node: SceneNode) {
    const styleData = this.getPerBreakpointStyles(node);
    const breakpointIndex = this.getBreakpointIndex();
    for (let i = breakpointIndex + 1; i < styleData.length; i++) {
      styleData[i].fontSize = styleData[breakpointIndex].fontSize;
    }
    this.setPerBreakpointStyles(node, styleData);

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
