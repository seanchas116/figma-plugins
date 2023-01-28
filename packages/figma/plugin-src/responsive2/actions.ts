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

export function clearCurrentArtboardResponsive() {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const artboard = ResponsiveArtboard.get(figma.currentPage.selection[0]);
  if (!artboard) {
    return;
  }

  artboard.clear();
  figma.commitUndo();
}

export function resizeCurrentArtboardWidth(width: number): void {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const artboard = ResponsiveArtboard.get(figma.currentPage.selection[0]);
  if (!artboard) {
    return;
  }

  artboard.resize(width);
  figma.commitUndo();
}
