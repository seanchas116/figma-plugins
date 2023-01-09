import * as IR from "@uimix/element-ir";
import { toElementIR } from "./toElementIR";
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

        components.push(component);
      }
    }

    // TODO: component set
  }

  return components;
}
