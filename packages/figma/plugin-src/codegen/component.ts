import * as IR from "@uimix/element-ir";
import { getElementIR } from "./element";

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

export async function getComponentIRs(page: PageNode): Promise<IR.Component[]> {
  const components: IR.Component[] = [];

  for (const child of page.children) {
    if (child.type === "FRAME" || child.type === "COMPONENT") {
      components.push(await getComponentIR(child));
    }
  }

  return components;
}

export async function getComponentIR(
  node: ComponentNode | FrameNode // TODO: ComponentSetNode
): Promise<IR.Component> {
  const elements = await getElementIR(node);
  if (elements.length !== 1) {
    throw new Error("Expected exactly one element");
  }

  const component: IR.Component = {
    element: elements[0],
    propertyDefinitions: [], // TODO
  };
  if (node.type === "COMPONENT") {
    component.key = node.key;
    for (const [name, info] of Object.entries(
      node.componentPropertyDefinitions
    )) {
      component.propertyDefinitions.push({
        name,
        type: convertPropType(info.type, info.variantOptions),
      });
    }
  }

  return component;
}
