import {
  getResponsiveFrameData,
  getResponsiveID,
  setResponsiveID,
} from "../pluginData";

export async function handleResponsiveContentChange(change: DocumentChange) {
  console.log(change);

  if (change.type === "DELETE") {
    const nodes = figma.root.findAll(
      (node) => node.type !== "PAGE" && getResponsiveID(node) === change.node.id
    );
    for (const node of nodes) {
      node.remove();
    }
    return;
  }

  if (change.type === "CREATE" || change.type === "PROPERTY_CHANGE") {
    const node = change.node;
    if (node.removed) {
      return;
    }

    const parent = node.parent;

    if (parent?.type !== "FRAME") {
      return;
    }
    const parentData = getResponsiveFrameData(parent);
    if (!parentData || parentData.maxWidth) {
      return;
    }

    const otherParents = (parent.parent?.children.filter(
      (child) =>
        child.type === "FRAME" &&
        getResponsiveFrameData(child) &&
        child !== parent
    ) ?? []) as FrameNode[];

    for (const otherParent of otherParents) {
      let clone = otherParent.children.find((child) => {
        return getResponsiveID(child) === node.id;
      }) as SceneNode | undefined;

      if (!clone) {
        clone = node.clone();
        setResponsiveID(clone, node.id);
        otherParent.appendChild(clone);
      }

      if (change.type === "PROPERTY_CHANGE") {
        if (node.type === "TEXT" && clone.type === "TEXT") {
          await figma.loadFontAsync(node.fontName as FontName);

          if (change.properties.includes("characters")) {
            clone.characters = node.characters;
          }
          if (change.properties.includes("fontSize")) {
            clone.fontSize = node.fontSize;
          }

          if (change.properties.includes("x")) {
            clone.x = node.x;
          }
          if (change.properties.includes("y")) {
            clone.y = node.y;
          }
          if (
            change.properties.includes("width") ||
            change.properties.includes("height")
          ) {
            clone.resizeWithoutConstraints(node.width, node.height);
          }
        }
        if (node.type === "RECTANGLE" && clone.type === "RECTANGLE") {
          if (change.properties.includes("x")) {
            clone.x = node.x;
          }
          if (change.properties.includes("y")) {
            clone.y = node.y;
          }
          if (
            change.properties.includes("width") ||
            change.properties.includes("height")
          ) {
            clone.resizeWithoutConstraints(node.width, node.height);
          }
        }
      }
    }
  }
}
