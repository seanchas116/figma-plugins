import { setResponsiveFrameData } from "../pluginData";
import { getFrameForNode } from "./resizeCurrentFrameWidth";

export function makeFrameResponsive() {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const frameNode = getFrameForNode(figma.currentPage.selection[0]);
  if (!frameNode) {
    return;
  }

  setResponsiveFrameData(frameNode, {});

  figma.commitUndo();
}
