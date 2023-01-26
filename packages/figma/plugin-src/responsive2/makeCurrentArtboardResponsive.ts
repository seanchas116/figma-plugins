import { setResponsiveArtboardData } from "../pluginData";
import { getArtboard } from "./getArtboard";

export function makeCurrentArtboardResponsive() {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const artboard = getArtboard(figma.currentPage.selection[0]);
  if (!artboard) {
    return;
  }

  setResponsiveArtboardData(artboard, {});

  figma.commitUndo();
}
