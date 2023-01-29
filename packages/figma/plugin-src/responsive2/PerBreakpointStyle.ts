import { PerBreakpointStyle } from "../pluginData";

function omitMixed<T>(value: T | typeof figma.mixed): T | undefined {
  return value === figma.mixed ? undefined : value;
}

export const observedProperties = new Set<NodeChangeProperty>([
  "x",
  "y",
  "width",
  "height",
  "layoutGrow",
  "layoutAlign",
  "layoutPositioning",

  "layoutMode",
  "primaryAxisSizingMode",
  "counterAxisSizingMode",
  "primaryAxisAlignItems",
  "counterAxisAlignItems",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "itemSpacing",
  "itemReverseZIndex",
  "strokesIncludedInLayout" as NodeChangeProperty,

  "fontSize",
  "textAutoResize",
]);

function isAbsolutePositioned(node: SceneNode) {
  if (node.parent?.type === "FRAME" && node.parent.layoutMode !== "NONE") {
    if ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE") {
      return true;
    }

    return false;
  }

  return true;
}

export function getPerBreakpointStyle(node: SceneNode): PerBreakpointStyle {
  const absolutePositioned = isAbsolutePositioned(node);

  let width: PerBreakpointStyle["width"] = { type: "fixed", value: node.width };
  let height: PerBreakpointStyle["height"] = {
    type: "fixed",
    value: node.height,
  };

  if ("layoutMode" in node) {
    if (node.layoutMode === "VERTICAL") {
      if (node.primaryAxisSizingMode === "AUTO") {
        height = { type: "hug" };
      }
      if (node.counterAxisSizingMode === "AUTO") {
        width = { type: "hug" };
      }
    }
    if (node.layoutMode === "HORIZONTAL") {
      if (node.primaryAxisSizingMode === "AUTO") {
        width = { type: "hug" };
      }
      if (node.counterAxisSizingMode === "AUTO") {
        height = { type: "hug" };
      }
    }
  }

  if ("layoutAlign" in node) {
    const parent = node.parent;
    if (parent && "layoutMode" in parent) {
      if (parent.layoutMode === "VERTICAL") {
        if (node.layoutAlign === "STRETCH") {
          width = { type: "fill" };
        }
        if (node.layoutGrow === 1) {
          height = { type: "fill" };
        }
      }
      if (parent.layoutMode === "HORIZONTAL") {
        if (node.layoutAlign === "STRETCH") {
          height = { type: "fill" };
        }
        if (node.layoutGrow === 1) {
          width = { type: "fill" };
        }
      }
    }
  }

  if (node.type === "TEXT") {
    if (node.textAutoResize === "WIDTH_AND_HEIGHT") {
      width = { type: "hug" };
      height = { type: "hug" };
    }
    if (node.textAutoResize === "HEIGHT") {
      height = { type: "hug" };
    }
  }

  return {
    x: absolutePositioned ? node.x : 0,
    y: absolutePositioned ? node.y : 0,
    width,
    height,
    ...("layoutAlign" in node
      ? {
          layoutPositioning: node.layoutPositioning,
        }
      : undefined),
    ...("layoutMode" in node
      ? {
          layoutMode: node.layoutMode,
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
          textAutoResize: node.textAutoResize,
        }
      : undefined),
  };
}

export function setPerBreakpointStyle(
  node: SceneNode,
  style: PerBreakpointStyle
) {
  if (style.x !== undefined) {
    node.x = style.x;
  }
  if (style.y !== undefined) {
    node.y = style.y;
  }

  // TODO: resize fixed size nodes

  if ("layoutAlign" in node) {
    const parent = node.parent;
    if (style.width && style.height) {
      if (parent && "layoutMode" in parent) {
        if (parent.layoutMode === "VERTICAL") {
          node.layoutAlign =
            style.width.type === "fill" ? "STRETCH" : "INHERIT";
          node.layoutGrow = style.height.type === "fill" ? 1 : 0;
        }
        if (parent.layoutMode === "HORIZONTAL") {
          node.layoutAlign =
            style.height.type === "fill" ? "STRETCH" : "INHERIT";
          node.layoutGrow = style.width.type === "fill" ? 1 : 0;
        }
      }
    }

    if (style.layoutPositioning !== undefined) {
      node.layoutPositioning = style.layoutPositioning;
    }
  }

  if ("layoutMode" in node) {
    if (style.layoutMode !== undefined) {
      node.layoutMode = style.layoutMode;
    }

    if (style.width && style.height) {
      if (node.layoutMode === "VERTICAL") {
        node.counterAxisSizingMode =
          style.width.type === "hug" ? "AUTO" : "FIXED";
        node.primaryAxisSizingMode =
          style.height.type === "hug" ? "AUTO" : "FIXED";
      }
      if (node.layoutMode === "HORIZONTAL") {
        node.primaryAxisSizingMode =
          style.width.type === "hug" ? "AUTO" : "FIXED";
        node.counterAxisSizingMode =
          style.height.type === "hug" ? "AUTO" : "FIXED";
      }
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
    if (style.textAutoResize !== undefined) {
      node.textAutoResize = style.textAutoResize;
    }
  }
}
