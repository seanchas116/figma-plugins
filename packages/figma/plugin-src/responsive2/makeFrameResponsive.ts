import { setResponsiveViewportData } from "../pluginData";
import { getTopLevelNode } from "./resizeCurrentFrameWidth";

export function makeTopLevelNodeResponsive() {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const topLevelNode = getTopLevelNode(figma.currentPage.selection[0]);
  if (!topLevelNode) {
    return;
  }

  setResponsiveViewportData(topLevelNode, {});

  figma.commitUndo();
}
