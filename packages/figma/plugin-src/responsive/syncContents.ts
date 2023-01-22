import {
  getOrGenerateResponsiveID,
  getResponsiveID,
  setResponsiveID,
} from "../pluginData";
import { copyProperties } from "../util/copyProperties";

interface Breakpoint {
  node: ComponentNode;
  minWidth: number;
}

function getMinWidthForVariant(variant: ComponentNode): number | undefined {
  const name = variant.name;
  const match = name.match(/minWidth=(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
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
  responsive: SceneNode,
  mode: "contents" | "style"
) {
  await copyProperties(
    original,
    responsive,
    mode === "style"
      ? []
      : [
          // Ignore responsive-related properties (such as font size, padding, layout direction etc.)
          "x",
          "y",
          "fontSize",
          "lineHeight",
          "paddingTop",
          "paddingRight",
          "paddingBottom",
          "paddingLeft",
          "layoutGrow",
          "layoutAlign",
          "layoutPositioning",
          "layoutMode",
          "primaryAxisSizingMode",
          "counterAxisSizingMode",
          "primaryAxisAlignItems",
          "counterAxisAlignItems",
          "width",
          "height",
        ]
  );
}

async function syncResponsiveNode(
  original: SceneNode & ChildrenMixin,
  responsive: SceneNode & ChildrenMixin,
  mode: "contents" | "style"
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
      await copyContentProperties(originalChild, responsiveChild, mode);
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
      await syncResponsiveNode(originalChild, responsiveChild, mode);
    }
  }

  for (const responsiveChild of responsiveChildrenToRemove) {
    responsiveChild.remove();
  }
}

export async function syncResponsiveContents() {
  const selected = figma.currentPage.selection[0];
  if (!selected) {
    return;
  }

  const breakpoint = getBreakpointForNode(selected);
  if (breakpoint) {
    for (const otherBreakpoint of getOtherBreakpoints(breakpoint)) {
      await syncResponsiveNode(
        breakpoint.node,
        otherBreakpoint.node,
        "contents"
      );
    }
  }
}

export async function copyStylesToLargerScreens() {
  const selected = figma.currentPage.selection[0];
  if (!selected) {
    return;
  }

  const breakpoint = getBreakpointForNode(selected);
  if (breakpoint) {
    for (const otherBreakpoint of getOtherBreakpoints(breakpoint)) {
      console.log(otherBreakpoint.minWidth, breakpoint.minWidth);
      if (otherBreakpoint.minWidth > breakpoint.minWidth) {
        await syncResponsiveNode(
          breakpoint.node,
          otherBreakpoint.node,
          "style"
        );
      }
    }
  }
}

export async function copyStylesToSmallerScreens() {
  const selected = figma.currentPage.selection[0];
  if (!selected) {
    return;
  }

  const breakpoint = getBreakpointForNode(selected);
  if (breakpoint) {
    for (const otherBreakpoint of getOtherBreakpoints(breakpoint)) {
      console.log(otherBreakpoint.minWidth, breakpoint.minWidth);
      if (otherBreakpoint.minWidth < breakpoint.minWidth) {
        await syncResponsiveNode(
          breakpoint.node,
          otherBreakpoint.node,
          "style"
        );
      }
    }
  }
}
