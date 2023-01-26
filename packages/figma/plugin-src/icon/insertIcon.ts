import { IconInfo } from "../../types/data";
import { setIconPluginData } from "../pluginData";

export function insertIcon(svgText: string, icon: IconInfo) {
  const newNode = createNodeFromIcon(svgText, icon);

  newNode.x = figma.viewport.center.x;
  newNode.y = figma.viewport.center.y;

  figma.currentPage.appendChild(newNode);
}

export function createNodeFromIcon(svgText: string, icon: IconInfo) {
  const newNode = figma.createNodeFromSvg(svgText);

  for (const child of newNode.children) {
    child.locked = true;
  }

  setIconPluginData(newNode, {
    version: 1,
    ...icon,
  });
  newNode.name = icon.name;

  return newNode;
}
