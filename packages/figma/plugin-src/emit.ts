import * as IR from "@uimix/element-ir";

function convertPaint(paint: Paint): IR.Paint {
  throw new Error("Not implemented");
}

export function toElementIR(node: SceneNode): IR.Element {
  if (node.type === "FRAME") {
    const parent = node.parent;

    const parentLayout =
      parent && "layoutMode" in parent ? parent.layoutMode : "NONE";

    const absolute =
      parentLayout === "NONE" || node.layoutPositioning === "ABSOLUTE";

    let width: number | "fit-content" | "auto" = node.width;
    let height: number | "fit-content" | "auto" = node.height;
    let flexGrow: 1 | 0 = 0;
    let alignSelf: "stretch" | "auto" = "auto";

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

    return {
      type: "frame",
      children: node.children.map(toElementIR),
      style: {
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
        overflow: node.clipsContent ? "hidden" : "visible",
        borderTopLeftRadius: node.topLeftRadius,
        borderTopRightRadius: node.topRightRadius,
        borderBottomLeftRadius: node.bottomLeftRadius,
        borderBottomRightRadius: node.bottomRightRadius,
        border: node.strokes.map(convertPaint),
        borderTopWidth: node.strokeTopWeight,
        borderRightWidth: node.strokeRightWeight,
        borderBottomWidth: node.strokeBottomWeight,
        borderLeftWidth: node.strokeLeftWeight,
        background:
          node.fills === figma.mixed ? [] : node.fills.map(convertPaint),

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
      },
    };
  }

  throw new Error("TODO");
}
