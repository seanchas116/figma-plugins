import { Target, CodeInstanceInfo } from "../types/data";
import { rpc } from "./code";
import { getElementIR } from "./codegen/element";
import { getInstanceInfo } from "./pluginData";

export async function onSelectionChange() {
  const selection = figma.currentPage.selection;

  const targets = await Promise.all(
    selection.map(async (node): Promise<Target> => {
      let instance: CodeInstanceInfo | undefined;
      if (node.type === "INSTANCE") {
        instance = getInstanceInfo(node);
      }

      return {
        instance,
        elementIR: await getElementIR(node),
      };
    })
  );

  rpc.remote.onTargetsChange(targets);
}
