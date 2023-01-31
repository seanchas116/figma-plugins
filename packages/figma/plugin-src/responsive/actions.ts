import { getTopLevelNode, ResponsiveArtboard } from "./ResponsiveArtboard";

export function makeCurrentArtboardResponsive() {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const topLevelNode = getTopLevelNode(figma.currentPage.selection[0]);
  if (!topLevelNode) {
    return;
  }

  if (topLevelNode.type !== "FRAME") {
    return;
  }

  const artboard = ResponsiveArtboard.attach(topLevelNode);
  figma.currentPage.selection = [artboard.node];

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
