import { setResponsiveArtboardData } from "../pluginData";
import { getArtboard } from "./getArtboard";
import { setPerBreakpointStyles } from "./setPerBreakpointStyles";

export function makeCurrentArtboardResponsive() {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const artboard = getArtboard(figma.currentPage.selection[0]);
  if (!artboard) {
    return;
  }

  setResponsiveArtboardData(artboard, {});
  setPerBreakpointStyles(artboard, 3);

  figma.commitUndo();
}
