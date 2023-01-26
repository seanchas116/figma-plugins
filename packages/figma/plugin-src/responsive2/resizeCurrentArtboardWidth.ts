import { getArtboard } from "./getArtboard";

export function resizeCurrentArtboardWidth(width: number): void {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const artboard = getArtboard(figma.currentPage.selection[0]);

  if (artboard && "resize" in artboard) {
    artboard.resize(width, artboard.height);
  }
}
