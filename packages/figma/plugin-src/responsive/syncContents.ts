import {
  getResponsiveFrameData,
  getResponsiveID,
  setResponsiveID,
} from "../pluginData";

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
      reconcileStructure(selected, otherBreakpointFrame);
    }
  }
}
