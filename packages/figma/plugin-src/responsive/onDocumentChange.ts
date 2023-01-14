import {
  getResponsiveFrameData,
  getResponsiveID,
  setResponsiveID,
} from "../pluginData";
import { debounce } from "../util/common";
import { MultiMap } from "../util/MultiMap";

// original node ID => responsive node IDs
const responsiveNodes = new MultiMap<string, string>();

function addResponsiveNodes(node: SceneNode) {
  const id = getResponsiveID(node);
  if (id) {
    responsiveNodes.add(id, node.id);
  }

  if ("children" in node) {
    for (const child of node.children) {
      addResponsiveNodes(child);
    }
  }
}
figma.root.children.forEach((page) =>
  page.children.forEach(addResponsiveNodes)
);

function handleDelete(change: DeleteChange) {
  for (const node of responsiveNodes.get(change.node.id)) {
    figma.getNodeById(node)?.remove();
  }
}

function reconcileStructure(
  original: SceneNode & ChildrenMixin,
  responsive: SceneNode & ChildrenMixin
) {
  const responsiveChildMap = new Map<string, SceneNode>();

  for (const responsiveChild of responsive.children) {
    const id = getResponsiveID(responsiveChild);
    if (id) {
      responsiveChildMap.set(id, responsiveChild);
    }
  }

  for (const originalChild of original.children) {
    const id = originalChild.id;

    let responsiveChild = responsiveChildMap.get(id);
    responsiveChildMap.delete(id);
    if (!responsiveChild) {
      responsiveChild = originalChild.clone();
      setResponsiveID(responsiveChild, id);
      responsiveNodes.add(id, responsiveChild.id);
    }
    responsive.appendChild(responsiveChild);

    if (
      "children" in originalChild &&
      "children" in responsiveChild &&
      originalChild.type !== "INSTANCE"
    ) {
      reconcileStructure(originalChild, responsiveChild);
    }
  }

  for (const responsiveChild of responsiveChildMap.values()) {
    responsiveChild.remove();
  }
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
    reconcileStructure(parent, otherParent);

    let clone = otherParent.children.find((child) => {
      return getResponsiveID(child) === node.id;
    }) as SceneNode | undefined;
    if (!clone) {
      throw new Error("Responsive node not found");
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

async function handleResponsiveContentChange(change: DocumentChange) {
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

const onDocumentChange = debounce(async (event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    await handleResponsiveContentChange(change);
  }
}, 200);

figma.on("documentchange", onDocumentChange);
