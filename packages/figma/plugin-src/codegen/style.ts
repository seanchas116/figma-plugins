import * as IR from "@uimix/element-ir";
import { parseFontName } from "../common";

export function convertScaleMode(
  scaleMode: ImagePaint["scaleMode"]
): "contain" | "cover" | "fill" {
  return scaleMode === "FIT"
    ? "contain"
    : scaleMode == "FILL"
    ? "cover"
    : "fill";
}

export function convertPaint(paint: Paint): IR.Paint {
  if (paint.type === "SOLID") {
    return {
      type: "solid",
      color: {
        r: paint.color.r,
        g: paint.color.g,
        b: paint.color.b,
        a: paint.opacity ?? 1,
      },
    };
  }

  if (paint.type === "IMAGE" && paint.imageHash) {
    return {
      type: "image",
      imageID: paint.imageHash,
      size: convertScaleMode(paint.scaleMode),
    };
  }

  // TODO: gradients

  return { type: "solid", color: { r: 0, g: 0, b: 0, a: 0 } };
}

export function getDimensionStyleMixin(
  node:
    | GroupNode
    | FrameNode
    | ComponentNode
    | ComponentSetNode
    | InstanceNode
    | RectangleNode
    | TextNode,
  positionOffset: Vector
): IR.DimensionStyleMixin {
  const parent = node.parent;

  const parentLayout =
    parent && "layoutMode" in parent ? parent.layoutMode : "NONE";

  const absolute =
    parentLayout === "NONE" ||
    ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE");

  let width: IR.DimensionStyleMixin["width"] = node.width;
  let height: IR.DimensionStyleMixin["height"] = node.height;

  if ("layoutMode" in node) {
    if (node.layoutMode === "VERTICAL") {
      if (node.primaryAxisSizingMode == "AUTO") {
        height = "fit-content";
      }
      if (node.counterAxisSizingMode == "AUTO") {
        width = "fit-content";
      }
    } else if (node.layoutMode === "HORIZONTAL") {
      if (node.primaryAxisSizingMode == "AUTO") {
        width = "fit-content";
      }
      if (node.counterAxisSizingMode == "AUTO") {
        height = "fit-content";
      }
    }
  }

  let flexGrow = 0;
  let alignSelf: "auto" | "stretch" = "auto";

  if ("layoutGrow" in node) {
    flexGrow = node.layoutGrow;
    alignSelf = node.layoutAlign === "STRETCH" ? "stretch" : "auto";

    if (parentLayout === "VERTICAL") {
      if (node.layoutGrow) {
        height = "auto";
      }
      if (node.layoutAlign === "STRETCH") {
        width = "auto";
      }
    } else if (parentLayout === "HORIZONTAL") {
      if (node.layoutGrow) {
        width = "auto";
      }
      if (node.layoutAlign === "STRETCH") {
        height = "auto";
      }
    }
  }

  if (node.type === "TEXT") {
    switch (node.textAutoResize) {
      case "WIDTH_AND_HEIGHT":
        width = "fit-content";
        height = "fit-content";
        break;
      case "HEIGHT":
        height = "fit-content";
        break;
      case "NONE":
        break;
    }
  }

  const x = absolute ? node.x + positionOffset.x : 0;
  const y = absolute ? node.y + positionOffset.y : 0;

  return {
    position: absolute ? "absolute" : "relative",
    display: node.visible ? "flex" : "none",
    x: {
      // TODO: support other constraints
      left: x,
    },
    y: {
      // TODO: support other constraints
      top: y,
    },
    width,
    height,
    flexGrow,
    alignSelf,
  };
}

export function getRectangleStyleMixin(
  node:
    | FrameNode
    | ComponentNode
    | ComponentSetNode
    | InstanceNode
    | RectangleNode
): IR.RectangleStyleMixin {
  const hasBorder = node.strokes.length > 0;
  return {
    borderRadius: [
      node.topLeftRadius,
      node.topRightRadius,
      node.bottomRightRadius,
      node.bottomLeftRadius,
    ],
    borderWidth: hasBorder
      ? [
          node.strokeTopWeight,
          node.strokeRightWeight,
          node.strokeBottomWeight,
          node.strokeLeftWeight,
        ]
      : [0, 0, 0, 0],
    border: node.strokes.map(convertPaint),
    background: node.fills === figma.mixed ? [] : node.fills.map(convertPaint),
  };
}

export function getFrameStyleMixin(
  node: FrameNode | ComponentNode | ComponentSetNode | InstanceNode
): IR.FrameStyleMixin {
  return {
    overflow: node.clipsContent ? "hidden" : "visible",
    flexDirection: node.layoutMode === "HORIZONTAL" ? "row" : "column",
    gap: node.itemSpacing,
    padding: [
      node.paddingTop,
      node.paddingRight,
      node.paddingBottom,
      node.paddingLeft,
    ],
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

export function getTextSpanStyleMixin(
  node: TextSublayerNode
): IR.TextSpanStyleMixin {
  const fontSize = node.fontSize !== figma.mixed ? node.fontSize : 16;

  const { family, weight, italic } = parseFontName(
    node.fontName !== figma.mixed
      ? node.fontName
      : { family: "Inter", style: "Regular" }
  );

  let lineHeight: IR.TextSpanStyleMixin["lineHeight"] = "normal";
  if (node.lineHeight !== figma.mixed) {
    if (node.lineHeight.unit === "PIXELS") {
      lineHeight = node.lineHeight.value / fontSize;
    } else if (node.lineHeight.unit === "PERCENT") {
      lineHeight = node.lineHeight.value / 100;
    }
  }

  let letterSpacing = 0;
  if (node.letterSpacing !== figma.mixed) {
    if (node.letterSpacing.unit === "PIXELS") {
      letterSpacing = node.letterSpacing.value / fontSize;
    } else if (node.letterSpacing.unit === "PERCENT") {
      letterSpacing = node.letterSpacing.value / 100;
    }
  }

  return {
    fontFamily: family,
    fontWeight: weight,
    fontStyle: italic ? "italic" : "normal",
    fontSize,
    lineHeight,
    letterSpacing,
    color: node.fills === figma.mixed ? [] : node.fills.map(convertPaint),
  };
}

export function getTextStyleMixin(node: TextNode): IR.TextStyleMixin {
  return {
    textAlign:
      node.textAlignHorizontal === "CENTER"
        ? "center"
        : node.textAlignHorizontal === "LEFT"
        ? "left"
        : "right",
    justifyContent:
      node.textAlignVertical === "CENTER"
        ? "center"
        : node.textAlignVertical === "TOP"
        ? "flex-start"
        : "flex-end",
  };
}
