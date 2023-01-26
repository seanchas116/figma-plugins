import { Target, CodeInstanceInfo } from "../types/data";
import { rpc } from "./rpc";
import { getElementIR } from "./codegen/element";
import { getIconPluginData, getInstanceInfo } from "./pluginData";
import { getResponsiveArtboardInfo } from "./responsive2/getArtboard";

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
        icon: getIconPluginData(node),
        responsiveArtboard: getResponsiveArtboardInfo(node),
        elementIR: await getElementIR(node),
      };
    })
  );

  void rpc.remote.onTargetsChange(targets);
}

figma.on("selectionchange", onSelectionChange);
figma.on("documentchange", onSelectionChange);
