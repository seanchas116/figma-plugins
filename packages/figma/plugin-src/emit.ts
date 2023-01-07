import * as IR from "@uimix/element-ir";
import { parseFontName } from "./common";

function convertScaleMode(
  scaleMode: ImagePaint["scaleMode"]
): "contain" | "cover" | "fill" {
  return scaleMode === "FIT"
    ? "contain"
    : scaleMode == "FILL"
    ? "cover"
    : "fill";
}

function convertPaint(paint: Paint): IR.Paint {
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

function getDimensionStyleMixin(
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

  if ("layoutGrow" in node) {
    if (parentLayout === "VERTICAL") {
      if (node.layoutGrow) {
        height = "stretch";
      }
      if (node.layoutAlign === "STRETCH") {
        width = "stretch";
      }
    } else if (parentLayout === "HORIZONTAL") {
      if (node.layoutGrow) {
        width = "stretch";
      }
      if (node.layoutAlign === "STRETCH") {
        height = "stretch";
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
  };
}

function getRectangleStyleMixin(
  node:
    | FrameNode
    | ComponentNode
    | ComponentSetNode
    | InstanceNode
    | RectangleNode
): IR.RectangleFillBorderStyleMixin {
  const hasBorder = node.strokes.length > 0;
  return {
    borderTopLeftRadius: node.topLeftRadius,
    borderTopRightRadius: node.topRightRadius,
    borderBottomLeftRadius: node.bottomLeftRadius,
    borderBottomRightRadius: node.bottomRightRadius,
    borderTopWidth: hasBorder ? node.strokeTopWeight : 0,
    borderRightWidth: hasBorder ? node.strokeRightWeight : 0,
    borderBottomWidth: hasBorder ? node.strokeBottomWeight : 0,
    borderLeftWidth: hasBorder ? node.strokeLeftWeight : 0,
    border: node.strokes.map(convertPaint),
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

function getTextSpanStyleMixin(node: TextSublayerNode): IR.TextSpanStyleMixin {
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

function getTextStyleMixin(node: TextNode): IR.TextStyleMixin {
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

const vectorLikeTypes: SceneNode["type"][] = [
  "LINE",
  "RECTANGLE",
  "ELLIPSE",
  "POLYGON",
  "STAR",
  "VECTOR",
  "BOOLEAN_OPERATION",
];

class SVGLikeNodeChecker {
  private readonly memo = new WeakMap<SceneNode, boolean>();

  check(node: SceneNode): boolean {
    const memo = this.memo.get(node);
    if (memo != null) {
      return memo;
    }

    if (vectorLikeTypes.includes(node.type)) {
      return true;
    }

    // TODO: text layers with strokes should be treated as SVG

    if (
      node.type === "FRAME" ||
      node.type === "INSTANCE" ||
      node.type === "COMPONENT" ||
      node.type === "COMPONENT_SET"
    ) {
      return this.checkFrameLike(node);
    }

    return false;
  }

  private checkFrameLike(
    node: FrameNode | ComponentNode | ComponentSetNode | InstanceNode
  ): boolean {
    if (node.children.length === 0) {
      return false;
    }

    for (const child of node.children) {
      if (!this.check(child)) {
        return false;
      }
      if ("constraints" in child) {
        if (
          child.constraints.horizontal !== "SCALE" ||
          child.constraints.vertical !== "SCALE"
        ) {
          return false;
        }
      }
    }

    return true;
  }
}

const svgLikeNodeChecker = new SVGLikeNodeChecker();

export async function toElementIR(
  node: SceneNode,
  positionOffset: Vector = { x: 0, y: 0 }
): Promise<IR.Element[]> {
  // ignore mask layers
  if ("isMask" in node && node.isMask) {
    return [];
  }

  // Image like node
  if (
    node.type == "RECTANGLE" &&
    node.fills !== figma.mixed &&
    node.fills.length
  ) {
    const fill = node.fills[0];
    if (fill.type === "IMAGE" && fill.imageHash) {
      return [
        {
          type: "image",
          id: node.id,
          name: node.name,
          imageID: fill.imageHash,
          style: {
            ...getDimensionStyleMixin(node, positionOffset),
            ...getRectangleStyleMixin(node),
            objectFit: convertScaleMode(fill.scaleMode),
          },
        },
      ];
    }
  }

  if (svgLikeNodeChecker.check(node)) {
    try {
      const svg = await node.exportAsync({ format: "SVG" });
      const svgText = String.fromCharCode(...svg);

      return [
        {
          type: "svg",
          id: node.id,
          name: node.name,
          svg: svgText,
          style: {
            ...getDimensionStyleMixin(node as FrameNode, positionOffset),
            ...getRectangleStyleMixin(node as FrameNode),
          },
        },
      ];
    } catch (error) {
      console.error(`error exporting ${node.name} to SVG`);
      console.error(String(error));
      return [];
    }
  }

  switch (node.type) {
    case "TEXT": {
      return [
        {
          type: "text",
          id: node.id,
          name: node.name,
          content: node.characters,
          style: {
            ...getDimensionStyleMixin(node, positionOffset),
            ...getTextSpanStyleMixin(node),
            ...getTextStyleMixin(node),
          },
        },
      ];
    }
    case "COMPONENT":
    case "COMPONENT_SET":
    case "INSTANCE":
    case "FRAME": {
      const children = (
        await Promise.all(node.children.map((child) => toElementIR(child)))
      ).flat();

      return [
        {
          type: "frame",
          id: node.id,
          name: node.name,
          children,
          style: {
            ...getDimensionStyleMixin(node, positionOffset),
            ...getRectangleStyleMixin(node),
            ...getFrameStyleMixin(node),
          },
        },
      ];
    }
    case "GROUP": {
      const parent = node.parent;

      if (parent && "layoutMode" in parent && parent.layoutMode !== "NONE") {
        // treat as frame

        const children = (
          await Promise.all(
            node.children.map((child) =>
              toElementIR(child, {
                x: -node.x,
                y: -node.y,
              })
            )
          )
        ).flat();

        return [
          {
            type: "frame",
            id: node.id,
            name: node.name,
            children,
            style: {
              ...getDimensionStyleMixin(node, positionOffset),

              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              borderTopWidth: 0,
              borderRightWidth: 0,
              borderBottomWidth: 0,
              borderLeftWidth: 0,
              border: [],
              background: [],

              overflow: "visible",
              flexDirection: "row",
              gap: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingLeft: 0,
              alignItems: "flex-start",
              justifyContent: "flex-start",
            },
          },
        ];
      }

      return (
        await Promise.all(node.children.map((child) => toElementIR(child)))
      ).flat();
    }
    default: {
      console.log("ignoring", node.type);
      return [];
    }
  }
}
