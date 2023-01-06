import * as IR from "@uimix/element-ir";

function convertPaint(paint: Paint): IR.Paint {
  throw new Error("Not implemented");
}

function getRectangleStyleMixin(
  node:
    | FrameNode
    | ComponentNode
    | ComponentSetNode
    | InstanceNode
    | RectangleNode
    | TextNode
): IR.RectangleStyleMixin {
  const parent = node.parent;

  const parentLayout =
    parent && "layoutMode" in parent ? parent.layoutMode : "NONE";

  const absolute =
    parentLayout === "NONE" ||
    ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE");

  let width: number | "fit-content" | "auto" = node.width;
  let height: number | "fit-content" | "auto" = node.height;
  let flexGrow: 1 | 0 = 0;
  let alignSelf: "stretch" | "auto" = "auto";

  if ("primaryAxisSizingMode" in node) {
    if (node.layoutMode === "VERTICAL") {
      if (node.primaryAxisSizingMode == "AUTO") {
        height = "fit-content";
      }
      if (node.counterAxisSizingMode == "AUTO") {
        width = "fit-content";
      }
    } else {
      if (node.primaryAxisSizingMode == "AUTO") {
        width = "fit-content";
      }
      if (node.counterAxisSizingMode == "AUTO") {
        height = "fit-content";
      }
    }
  }

  if ("layoutGrow" in node) {
    if (parentLayout === "VERTICAL") {
      if (node.layoutGrow) {
        flexGrow = 1;
        height = "auto";
      }
      if (node.layoutAlign === "STRETCH") {
        alignSelf = "stretch";
        width = "auto";
      }
    } else if (parentLayout === "HORIZONTAL") {
      if (node.layoutGrow) {
        flexGrow = 1;
        width = "auto";
      }
      if (node.layoutAlign === "STRETCH") {
        alignSelf = "stretch";
        height = "auto";
      }
    }
  }

  let borderTopLeftRadius = 0;
  let borderTopRightRadius = 0;
  let borderBottomLeftRadius = 0;
  let borderBottomRightRadius = 0;
  let borderTopWidth = 0;
  let borderRightWidth = 0;
  let borderBottomWidth = 0;
  let borderLeftWidth = 0;
  if (node.type !== "TEXT") {
    borderTopLeftRadius = node.topLeftRadius;
    borderTopRightRadius = node.topRightRadius;
    borderBottomLeftRadius = node.bottomLeftRadius;
    borderBottomRightRadius = node.bottomRightRadius;
    borderTopWidth = node.strokeTopWeight;
    borderRightWidth = node.strokeRightWeight;
    borderBottomWidth = node.strokeBottomWeight;
    borderLeftWidth = node.strokeLeftWeight;
  }

  return {
    position: absolute ? "absolute" : "relative",
    display: node.visible ? "flex" : "none",
    x: {
      // TODO: support other constraints
      left: node.x,
    },
    y: {
      // TODO: support other constraints
      top: node.y,
    },
    width,
    height,
    flexGrow,
    alignSelf,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    border: node.strokes.map(convertPaint),
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderLeftWidth,
    background: node.fills === figma.mixed ? [] : node.fills.map(convertPaint),
  };
}

function getFrameStyleMixin(
  node: FrameNode | ComponentNode | ComponentSetNode | InstanceNode
): IR.FrameStyleMixin {
  return {
    overflow: node.clipsContent ? "hidden" : "visible",
    flexDirection: node.layoutMode === "HORIZONTAL" ? "row" : "column",
    gap: node.itemSpacing,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    alignItems:
      node.counterAxisAlignItems === "CENTER"
        ? "center"
        : node.counterAxisAlignItems === "MIN"
        ? "flex-start"
        : node.counterAxisAlignItems === "MAX"
        ? "flex-end"
        : "baseline",
    justifyContent:
      node.primaryAxisAlignItems === "CENTER"
        ? "center"
        : node.primaryAxisAlignItems === "MIN"
        ? "flex-start"
        : node.primaryAxisAlignItems === "MAX"
        ? "flex-end"
        : "space-between",
  };
}

export function toElementIR(node: SceneNode): IR.Element[] {
  if (node.type === "FRAME") {
    return [
      {
        type: "frame",
        children: node.children.flatMap(toElementIR),
        style: {
          ...getRectangleStyleMixin(node),
          ...getFrameStyleMixin(node),
        },
      },
    ];
  }
  if (node.type === "GROUP") {
    // flatten groups
    return node.children.flatMap(toElementIR);
  }

  console.log("TODO");
  return [];
}
