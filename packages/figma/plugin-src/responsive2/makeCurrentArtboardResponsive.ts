import { getTopLevelNode, ResponsiveArtboard } from "./ResponsiveArtboard";

export function makeCurrentArtboardResponsive() {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const topLevelNode = getTopLevelNode(figma.currentPage.selection[0]);
  if (!topLevelNode) {
    return;
  }

  ResponsiveArtboard.attach(topLevelNode);
  figma.commitUndo();
}
