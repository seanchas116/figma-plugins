import { ResponsiveViewportInfo } from "../../types/data";
import { getResponsiveViewportData } from "../pluginData";

export function getTopLevelNode(node: SceneNode): SceneNode | undefined {
  const parent = node.parent;
  if (!parent || parent.type === "DOCUMENT") {
    return;
  }
  if (parent.type === "PAGE") {
    return node;
  }
  return getTopLevelNode(parent);
}

export function getResponsiveViewportInfo(
  node: SceneNode
): ResponsiveViewportInfo | undefined {
  const topLevelNode = getTopLevelNode(node);
  if (!topLevelNode) {
    return;
  }
  const responsiveData = getResponsiveViewportData(topLevelNode);
  if (!responsiveData) {
    return;
  }

  return {
    width: topLevelNode.width,
  };
}

export function resizeCurrentResponsiveViewportWidth(width: number): void {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const frameNode = getTopLevelNode(figma.currentPage.selection[0]);

  if (frameNode && "resize" in frameNode) {
    frameNode.resize(width, frameNode.height);
  }
}
