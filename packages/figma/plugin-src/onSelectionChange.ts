import { Target, CodeInstanceInfo } from "../types/data";
import { rpc } from "./rpc";
import { getElementIR } from "./codegen/element";
import { getIconPluginData, getInstanceInfo } from "./pluginData";

function getFrameWidth(node: SceneNode): number {
  const parent = node.parent;
  if (!parent || parent.type === "DOCUMENT") {
    return 0;
  }
  if (parent.type === "PAGE") {
    return node.width;
  }
  return getFrameWidth(parent);
}

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
        frameWidth: getFrameWidth(node),
        elementIR: await getElementIR(node),
      };
    })
  );

  void rpc.remote.onTargetsChange(targets);
}

figma.on("selectionchange", onSelectionChange);
figma.on("documentchange", onSelectionChange);
