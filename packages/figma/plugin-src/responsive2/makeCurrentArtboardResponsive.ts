import { getArtboard, ResponsiveArtboard } from "./ResponsiveArtboard";

export function makeCurrentArtboardResponsive() {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const artboard = getArtboard(figma.currentPage.selection[0]);
  if (!artboard) {
    return;
  }

  ResponsiveArtboard.attach(artboard);
  figma.commitUndo();
}
