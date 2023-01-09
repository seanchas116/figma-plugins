import * as IR from "@uimix/element-ir";
import {
  getDimensionStyleMixin,
  getRectangleStyleMixin,
  getTextSpanStyleMixin,
  getTextStyleMixin,
  getFrameStyleMixin,
  convertScaleMode,
} from "./style";
import { svgLikeNodeChecker } from "./SVGLikeNodeChecker";

export async function getElementIR(
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
      if (node.type === "INSTANCE") {
        if (node.overrides.length === 0 && node.mainComponent) {
          // export as instance
          // TODO: load remote component?

          return [
            {
              type: "instance",
              id: node.id,
              name: node.name,
              componentKey: node.mainComponent.key,
              properties: {
                // TODO
              },
            },
          ];
        }
        console.log(node.overrides);
      }

      const children = (
        await Promise.all(node.children.map((child) => getElementIR(child)))
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
              getElementIR(child, {
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

              borderRadius: [0, 0, 0, 0],
              borderWidth: [0, 0, 0, 0],
              border: [],
              background: [],

              overflow: "visible",
              flexDirection: "row",
              gap: 0,
              padding: [0, 0, 0, 0],
              alignItems: "flex-start",
              justifyContent: "flex-start",
            },
          },
        ];
      }

      return (
        await Promise.all(node.children.map((child) => getElementIR(child)))
      ).flat();
    }
    default: {
      console.log("ignoring", node.type);
      return [];
    }
  }
}
