import {
  getOrGenerateResponsiveID,
  getResponsiveFrameData,
  getResponsiveID,
  ResponsiveFrameData,
  setResponsiveID,
} from "../pluginData";

interface Breakpoint {
  node: ComponentNode;
  data: ResponsiveFrameData;
}

function getBreakpointForNode(node: BaseNode): Breakpoint | undefined {
  if (node.type === "COMPONENT") {
    const parentData = getResponsiveFrameData(node);
    if (parentData) {
      return { node, data: parentData };
    }
  }

  const parent = node.parent;
  if (parent) {
    return getBreakpointForNode(parent);
  }
}

function getOtherBreakpoints(breakpoint: Breakpoint): Breakpoint[] {
  const otherBreakpoints: Breakpoint[] = [];
  for (const node of breakpoint.node.parent?.children ?? []) {
    if (node === breakpoint.node) {
      continue;
    }

    if (node.type === "COMPONENT") {
      const data = getResponsiveFrameData(node);
      if (data) {
        otherBreakpoints.push({ node, data });
      }
    }
  }
  return otherBreakpoints;
}

async function copyContentProperties(
  original: SceneNode,
  responsive: SceneNode
) {
  if (original.type !== responsive.type) {
    throw new Error("Cannot copy properties between different node types");
  }

  if (original.type === "TEXT" && responsive.type === "TEXT") {
    if (original.fontName !== figma.mixed) {
      await figma.loadFontAsync(original.fontName);
    }
    responsive.characters = original.characters;
  }
}

async function syncResponsiveNode(
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
    const id = getOrGenerateResponsiveID(originalChild);

    // find reusable child
    let responsiveChild = responsiveChildMap.get(id);
    if (responsiveChild?.type !== originalChild.type) {
      responsiveChild = undefined;
    }

    if (responsiveChild) {
      responsiveChildrenToRemove.delete(responsiveChild);
      copyContentProperties(originalChild, responsiveChild);
    } else {
      responsiveChild = originalChild.clone();
      setResponsiveID(responsiveChild, id);
    }
    responsive.appendChild(responsiveChild);

    if (
      "children" in originalChild &&
      "children" in responsiveChild &&
      originalChild.type !== "INSTANCE"
    ) {
      await syncResponsiveNode(originalChild, responsiveChild);
    }
  }

  for (const responsiveChild of responsiveChildrenToRemove) {
    responsiveChild.remove();
  }
}

export function syncResponsiveContents() {
  const selected = figma.currentPage.selection[0];
  if (!selected) {
    return;
  }

  const breakpoint = getBreakpointForNode(selected);
  if (breakpoint) {
    for (const otherBreakpoint of getOtherBreakpoints(breakpoint)) {
      syncResponsiveNode(breakpoint.node, otherBreakpoint.node);
    }
  }
}
