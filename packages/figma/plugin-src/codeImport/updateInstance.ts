import { CodeInstanceInfo } from "../../types/data";
import { setInstanceParams } from "../pluginData";
import { renderInstance } from "./render";

export async function updateInstance(
  instance?: CodeInstanceInfo | undefined
): Promise<void> {
  const selection = figma.currentPage.selection;
  if (!selection.length) {
    return;
  }

  const node = selection[0];
  if (node.type !== "INSTANCE") {
    return;
  }

  const instanceInfo = instance;
  setInstanceParams(node, instanceInfo);
  if (instanceInfo) {
    node.setRelaunchData({
      open: "",
    });
    await renderInstance(node);
  } else {
    node.setRelaunchData({});
  }
}
