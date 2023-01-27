import { ResponsiveArtboard } from "./ResponsiveArtboard";

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
