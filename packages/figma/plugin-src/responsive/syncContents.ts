import {
  getResponsiveFrameData,
  getResponsiveID,
  setResponsiveID,
} from "../pluginData";

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
    const id = originalChild.id;

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
  if (selected.type !== "COMPONENT") {
    return;
  }

  const breakpoint = getResponsiveFrameData(selected as ComponentNode);
  if (breakpoint && !breakpoint.maxWidth) {
    // this is a main breakpoint

    const otherBreakpointFrames = selected.parent?.children ?? [];

    for (const otherBreakpointFrame of otherBreakpointFrames) {
      if (otherBreakpointFrame.type !== "COMPONENT") {
        continue;
      }
      if (otherBreakpointFrame === selected) {
        continue;
      }
      syncResponsiveNode(selected, otherBreakpointFrame);
    }
  }
}
