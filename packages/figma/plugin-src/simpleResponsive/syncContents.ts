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

function copyContentProperties(
  original: SceneNode,
  responsive: SceneNode,
  mode: "contents" | "style"
) {
  copyProperties(
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

function getResponsiveID(node: SceneNode): string {
  return node.type + ":" + node.name;
}

function getOrInsertDefault<K, T>(
  map: Map<K, T>,
  key: K,
  defaultValue: () => T
) {
  let value = map.get(key);
  if (value === undefined) {
    value = defaultValue();
    map.set(key, value);
  }
  return value;
}

function syncResponsiveNode(
  original: SceneNode & ChildrenMixin,
  responsive: SceneNode & ChildrenMixin,
  mode: "contents" | "style"
) {
  const responsiveChildMap = new Map<string, SceneNode[]>();
  const responsiveChildrenToRemove = new Set<SceneNode>(responsive.children);

  for (const responsiveChild of responsive.children) {
    const id = getResponsiveID(responsiveChild);
    const nodes = getOrInsertDefault(responsiveChildMap, id, () => []);
    nodes.push(responsiveChild);
  }

  for (const originalChild of original.children) {
    const id = getResponsiveID(originalChild);

    // find reusable child
    let responsiveChild = responsiveChildMap.get(id)?.shift();

    if (responsiveChild) {
      responsiveChildrenToRemove.delete(responsiveChild);
      copyContentProperties(originalChild, responsiveChild, mode);
    } else {
      responsiveChild = originalChild.clone();
    }
    responsive.appendChild(responsiveChild);

    if (
      "children" in originalChild &&
      "children" in responsiveChild &&
      originalChild.type !== "INSTANCE"
    ) {
      syncResponsiveNode(originalChild, responsiveChild, mode);
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
      syncResponsiveNode(breakpoint.node, otherBreakpoint.node, "contents");
    }
  }
}

export function copyStylesToLargerScreens() {
  const selected = figma.currentPage.selection[0];
  if (!selected) {
    return;
  }

  const breakpoint = getBreakpointForNode(selected);
  if (breakpoint) {
    for (const otherBreakpoint of getOtherBreakpoints(breakpoint)) {
      console.log(otherBreakpoint.minWidth, breakpoint.minWidth);
      if (otherBreakpoint.minWidth > breakpoint.minWidth) {
        syncResponsiveNode(breakpoint.node, otherBreakpoint.node, "style");
      }
    }
  }
}

export function copyStylesToSmallerScreens() {
  const selected = figma.currentPage.selection[0];
  if (!selected) {
    return;
  }

  const breakpoint = getBreakpointForNode(selected);
  if (breakpoint) {
    for (const otherBreakpoint of getOtherBreakpoints(breakpoint)) {
      console.log(otherBreakpoint.minWidth, breakpoint.minWidth);
      if (otherBreakpoint.minWidth < breakpoint.minWidth) {
        syncResponsiveNode(breakpoint.node, otherBreakpoint.node, "style");
      }
    }
  }
}
