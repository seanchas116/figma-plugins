import * as IR from "@uimix/element-ir";
import { toElementIR } from "./toElementIR";

function convertPropType(
  type: ComponentPropertyType,
  options?: string[]
): IR.PropertyType {
  if (type === "BOOLEAN") {
    return { type: "boolean" };
  }
  if (type === "TEXT") {
    return { type: "string" };
  }
  if (type === "INSTANCE_SWAP") {
    return { type: "instance" };
  }
  if (type === "VARIANT") {
    return { type: "enum", options: options ?? [] };
  }
  console.error('Unknown property type "' + type + '"');
  return { type: "boolean" };
}

export async function toComponents(): Promise<IR.Component[]> {
  const components: IR.Component[] = [];

  for (const child of figma.currentPage.children) {
    if (child.type === "FRAME" || child.type === "COMPONENT") {
      const elements = await toElementIR(child);
      if (elements.length === 1) {
        const component: IR.Component = {
          element: elements[0],
          propertyDefinitions: [], // TODO
        };
        if (child.type === "COMPONENT") {
          component.key = child.key;
          for (const [name, info] of Object.entries(
            child.componentPropertyDefinitions
          )) {
            component.propertyDefinitions.push({
              name,
              type: convertPropType(info.type, info.variantOptions),
            });
          }
        }

        components.push(component);
      }
    }

    // TODO: component set
  }

  return components;
}
