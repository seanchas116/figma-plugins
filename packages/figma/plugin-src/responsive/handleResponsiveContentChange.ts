import {
  getResponsiveFrameData,
  getResponsiveID,
  setResponsiveID,
} from "../pluginData";

function handleDelete(change: DeleteChange) {
  const nodes = figma.root.findAll(
    (node) => node.type !== "PAGE" && getResponsiveID(node) === change.node.id
  );
  for (const node of nodes) {
    node.remove();
  }
  return;
}

async function handleChange(change: CreateChange | PropertyChange) {
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

      // looks like the layer is moved inside the tree
      // FIXME: time complexity is O(n^2) here, needs better Figma plugin API
      if (change.properties.includes("parent")) {
        const index = parent.children.findIndex(
          (child) => child.id === node.id
        );
        const index2 = otherParent.children.findIndex(
          (child) => child.id === clone!.id
        );

        if (index >= 0) {
          if (index2 >= 0 && index > index2) {
            otherParent.insertChild(index + 1, clone);
          } else {
            otherParent.insertChild(index, clone);
          }
        }
      }
    }
  }
}

export async function handleResponsiveContentChange(change: DocumentChange) {
  console.log(change);

  if (change.type === "DELETE") {
    handleDelete(change);
    return;
  }

  if (change.type === "CREATE" || change.type === "PROPERTY_CHANGE") {
    await handleChange(change);
    return;
  }
}