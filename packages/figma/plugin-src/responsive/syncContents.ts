import {
  getOrGenerateResponsiveID,
  getResponsiveID,
  setResponsiveID,
} from "../pluginData";
import { getPropertyDescriptor } from "../util/common";
import { copyProperties } from "../util/copyProperties";

interface Breakpoint {
  node: ComponentNode;
  minWidth: number | "none";
}

function getMinWidthForVariant(
  variant: ComponentNode
): number | "none" | undefined {
  const name = variant.name;
  const match = name.match(/minWidth=(\d+|none)/);
  if (match) {
    return match[1] === "none" ? "none" : parseInt(match[1], 10);
  }
}

function getBreakpointForNode(node: BaseNode): Breakpoint | undefined {
  if (node.type === "COMPONENT") {
    const minWidth = getMinWidthForVariant(node);
    console.log(node.name, minWidth);
    if (minWidth !== undefined) {
      return { node, minWidth };
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
      const minWidth = getMinWidthForVariant(node);
      if (minWidth !== undefined) {
        otherBreakpoints.push({ node, minWidth });
      }
    }
  }
  return otherBreakpoints;
}

async function copyContentProperties(
  original: SceneNode,
  responsive: SceneNode
) {
  copyProperties(original, responsive, [
    // Ignore responsive-related properties (such as font size, padding, layout direction etc.)
    "fontSize",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "layoutMode",
    "primaryAxisSizingMode",
    "counterAxisSizingMode",
    "primaryAxisAlignItems",
    "counterAxisAlignItems",
  ]);
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
