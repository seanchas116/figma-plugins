import {
  getResponsiveFrameData,
  getResponsiveID,
  ResponsiveFrameData,
  setResponsiveID,
} from "../pluginData";
import { MultiMap } from "../util/MultiMap";

interface Breakpoint {
  node: ComponentNode;
  data: ResponsiveFrameData;
}

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

function reconcileStructure(
  original: SceneNode & ChildrenMixin,
  responsive: SceneNode & ChildrenMixin
) {
  const responsiveChildMap = new Map<string, SceneNode>();
  const responsiveChildrenToRemove = new Set<SceneNode>(responsive.children);

  for (const responsiveChild of responsive.children) {
    const id = getResponsiveID(responsiveChild);
    if (id) {
      responsiveChildMap.set(id, responsiveChild);
    }
  }

  for (const originalChild of original.children) {
    const id = originalChild.id;

    let responsiveChild = responsiveChildMap.get(id);
    if (responsiveChild) {
      responsiveChildrenToRemove.delete(responsiveChild);
    } else {
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

  for (const responsiveChild of responsiveChildrenToRemove) {
    responsiveChild.remove();
  }
}

function handleDelete(change: DeleteChange) {
  const responsiveIDs = responsiveNodes.get(change.node.id) ?? [];
  for (const responsiveID of responsiveIDs) {
    const responsiveNode = figma.getNodeById(responsiveID);
    if (responsiveNode) {
      responsiveNode.remove();
    }
  }
  responsiveNodes.delete(change.node.id);
}

async function handleChange(change: PropertyChange) {
  const node = change.node;
  if (node.removed) {
    return;
  }

  for (const responsiveID of responsiveNodes.get(node.id) || []) {
    const clone = figma.getNodeById(responsiveID) as SceneNode;
    if (!clone) {
      continue;
    }

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

function getBreakpointForNode(node: BaseNode): Breakpoint | undefined {
  const parent = node.parent;
  if (!parent) {
    return;
  }

  if (parent.type === "COMPONENT") {
    const parentData = getResponsiveFrameData(parent);
    if (parentData) {
      return { node: parent, data: parentData };
    }
  }

  return getBreakpointForNode(parent);
}

const onDocumentChange = async (event: DocumentChangeEvent) => {
  // handle deletes

  for (const change of event.documentChanges) {
    if (change.type === "DELETE") {
      handleDelete(change);
    }
  }

  // handle structure changes

  const structureChangedBreakpoints = new Map<string, Breakpoint>();

  for (const change of event.documentChanges) {
    if (
      (change.type === "CREATE" ||
        (change.type === "PROPERTY_CHANGE" &&
          change.properties.includes("parent"))) &&
      !change.node.removed
    ) {
      if (!change.node.removed) {
        const breakpoint = getBreakpointForNode(change.node);
        console.log(breakpoint);
        if (breakpoint) {
          structureChangedBreakpoints.set(breakpoint.node.id, breakpoint);
        }
      }
    }
  }

  for (const breakpoint of structureChangedBreakpoints.values()) {
    if (breakpoint.data.maxWidth) {
      continue;
    }

    const otherBreakpoints: Breakpoint[] = [];
    for (const node of breakpoint.node.parent?.children ?? []) {
      if (node.type === "COMPONENT") {
        const data = getResponsiveFrameData(node);
        if (data && data.maxWidth) {
          otherBreakpoints.push({ node, data });
        }
      }
    }
    for (const other of otherBreakpoints) {
      reconcileStructure(breakpoint.node, other.node);
    }
  }

  // handle property changes

  for (const change of event.documentChanges) {
    if (change.type === "PROPERTY_CHANGE") {
      await handleChange(change);
      return;
    }
  }
};

// TODO: debounce
figma.on("documentchange", onDocumentChange);
