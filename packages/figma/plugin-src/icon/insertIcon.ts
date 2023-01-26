import { IconInfo } from "../../types/data";
import { getIconPluginData, setIconPluginData } from "../pluginData";

export function insertIcon(svgText: string, icon: IconInfo) {
  for (const selected of figma.currentPage.selection) {
    if (selected.type === "FRAME") {
      const iconPluginData = getIconPluginData(selected);
      if (iconPluginData) {
        // replace icon content

        const newNode = createNodeFromIcon(svgText, icon);
        for (const child of selected.children) {
          child.remove();
        }
        for (const child of newNode.children) {
          child.locked = true;
          selected.appendChild(child);
        }

        figma.notify(`Changed to ${icon.name}`);
        return;
      }
    }
  }

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
