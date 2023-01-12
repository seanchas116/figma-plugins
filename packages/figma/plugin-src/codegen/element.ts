import * as IR from "@uimix/element-ir";
import { FrameStyle, InstanceStyle } from "@uimix/element-ir";
import { getInstanceInfo } from "../pluginData";
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

  const commonProps: IR.CommonProps = {
    id: node.id,
    name: node.name,
    propertyRef: {
      visible: node.componentPropertyReferences?.visible,
      children: node.componentPropertyReferences?.characters,
      component: node.componentPropertyReferences?.mainComponent,
    },
  };

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
          ...commonProps,
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
          ...commonProps,
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

  if (node.type === "INSTANCE") {
    const codeInstanceInfo = getInstanceInfo(node);
    if (codeInstanceInfo) {
      const { props, component, autoResize } = codeInstanceInfo;

      const style = getDimensionStyleMixin(node, positionOffset);
      if (autoResize === "widthHeight") {
        style.width = "fit-content";
        style.height = "fit-content";
      } else if (autoResize === "height") {
        style.height = "fit-content";
      }

      return [
        {
          type: "codeInstance",
          ...commonProps,
          component,
          properties: props,
          style,
        },
      ];
    }
  }

  switch (node.type) {
    case "TEXT": {
      return [
        {
          type: "text",
          ...commonProps,
          children: node.characters,
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
      const style = {
        ...getDimensionStyleMixin(node, positionOffset),
        ...getRectangleStyleMixin(node),
        ...getFrameStyleMixin(node),
      };

      if (node.type === "INSTANCE") {
        const hasInnerOverrides = node.overrides.some(
          (override) => override.id !== node.id
        );

        if (!hasInnerOverrides && node.mainComponent) {
          // export as instance
          // TODO: load remote component?

          const properties: Record<string, any> = {};
          for (const [name, info] of Object.entries(node.componentProperties)) {
            properties[name] = info.value;
          }

          const mainStyle: FrameStyle = {
            ...getDimensionStyleMixin(node.mainComponent, { x: 0, y: 0 }),
            ...getRectangleStyleMixin(node.mainComponent),
            ...getFrameStyleMixin(node.mainComponent),
            position: "relative",
            x: { left: 0 },
            y: { top: 0 },
          };
          const overrideStyle: InstanceStyle = {};
          for (const [_key, value] of Object.entries(style)) {
            const key = _key as keyof InstanceStyle;
            if (JSON.stringify(value) !== JSON.stringify(mainStyle[key])) {
              overrideStyle[key] = value as any;
            }
          }

          return [
            {
              type: "instance",
              ...commonProps,
              componentKey: node.mainComponent.key,
              properties,
              style: overrideStyle,
            },
          ];
        }
      }

      const children = (
        await Promise.all(node.children.map((child) => getElementIR(child)))
      ).flat();

      return [
        {
          type: "frame",
          ...commonProps,
          style,
          children,
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
            ...commonProps,
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
      console.error("ignoring", node.type);
      return [];
    }
  }
}
