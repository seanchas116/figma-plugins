import { ResponsiveArtboardInfo } from "../../types/data";
import { getResponsiveArtboardData } from "../pluginData";

// Get the top-level node (aka artboard)
export function getArtboard(node: SceneNode): SceneNode | undefined {
  const parent = node.parent;
  if (!parent || parent.type === "DOCUMENT") {
    return;
  }
  if (parent.type === "PAGE") {
    return node;
  }
  return getArtboard(parent);
}

export function getResponsiveArtboardInfo(
  node: SceneNode
): ResponsiveArtboardInfo | undefined {
  const artboard = getArtboard(node);
  if (!artboard) {
    return;
  }
  const responsiveData = getResponsiveArtboardData(artboard);
  if (!responsiveData) {
    return;
  }

  return {
    width: artboard.width,
  };
}

export function resizeCurrentArtboardWidth(width: number): void {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const artboard = getArtboard(figma.currentPage.selection[0]);

  if (artboard && "resize" in artboard) {
    artboard.resize(width, artboard.height);
  }
}
