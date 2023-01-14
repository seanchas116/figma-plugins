import {
  getResponsiveFrameData,
  getResponsiveID,
  ResponsiveFrameData,
  setResponsiveID,
} from "../pluginData";
import { debounce } from "../util/common";
import { MultiMap } from "../util/MultiMap";

interface Breakpoint {
  node: FrameNode;
  data: ResponsiveFrameData;
}

// original node ID => responsive node IDs
const responsiveNodes = new MultiMap<string, string>();

// TODO: set breakpointForNode on document change
const breakpointForNode = new Map<string, string>();

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

function getBreakpointForNode(
  node: SceneNode | RemovedNode
): Breakpoint | undefined {
  if (node.removed) {
    const breakpointID = breakpointForNode.get(node.id);
    if (!breakpointID) {
      return;
    }
    const breakpointNode = figma.getNodeById(breakpointID);
    if (!breakpointForNode) {
      return;
    }
    const data = getResponsiveFrameData(breakpointNode as FrameNode);
    if (!data) {
      return;
    }
    return { node: breakpointNode as FrameNode, data };
  }

  const parent = node.parent;

  if (parent?.type !== "FRAME") {
    return;
  }
  const parentData = getResponsiveFrameData(parent);
  if (!parentData) {
    return getBreakpointForNode(parent);
  }

  return { node: parent, data: parentData };
}

async function handleResponsiveContentChanges(
  breakpoint: Breakpoint,
  changes: DocumentChange[]
) {
  console.log(changes);
  // Ignore non-main breakpoints
  if (breakpoint.data.maxWidth) {
    return;
  }

  let structureChanged = false;
  for (const change of changes) {
    if (change.type === "DELETE" || change.type === "CREATE") {
      structureChanged = true;
      break;
    }
    if (change.type === "PROPERTY_CHANGE") {
      if (change.properties.includes("parent")) {
        structureChanged = true;
        break;
      }
    }
  }

  if (structureChanged) {
    const breakpoints: Breakpoint[] = [];
    for (const node of breakpoint.node.parent?.children ?? []) {
      if (node.type === "FRAME") {
        const data = getResponsiveFrameData(node);
        if (data) {
          breakpoints.push({ node, data });
        }
      }
    }
    const otherBreakpoints = breakpoints.filter((b) => b.data.maxWidth);
    for (const other of otherBreakpoints) {
      reconcileStructure(breakpoint.node, other.node);
    }
  }

  for (const change of changes) {
    if (change.type === "PROPERTY_CHANGE") {
      await handleChange(change);
      return;
    }
  }
}

const onDocumentChange = debounce((event: DocumentChangeEvent) => {
  const changesForBreakpoint = new Map<
    string,
    Breakpoint & {
      changes: DocumentChange[];
    }
  >();

  for (const change of event.documentChanges) {
    if ("node" in change) {
      const breakpoint = getBreakpointForNode(change.node);
      if (breakpoint) {
        if (changesForBreakpoint.has(breakpoint.node.id)) {
          changesForBreakpoint.get(breakpoint.node.id)!.changes.push(change);
        } else {
          changesForBreakpoint.set(breakpoint.node.id, {
            ...breakpoint,
            changes: [change],
          });
        }
      }
    }
  }

  console.log(changesForBreakpoint);

  for (const breakpoint of changesForBreakpoint.values()) {
    handleResponsiveContentChanges(breakpoint, breakpoint.changes);
  }
}, 200);

figma.on("documentchange", onDocumentChange);
