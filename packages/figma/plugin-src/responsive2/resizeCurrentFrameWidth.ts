export function getFrameForNode(node: SceneNode): SceneNode | undefined {
  const parent = node.parent;
  if (!parent || parent.type === "DOCUMENT") {
    return;
  }
  if (parent.type === "PAGE") {
    return node;
  }
  return getFrameForNode(parent);
}

export function getFrameWidth(node: SceneNode): number {
  return getFrameForNode(node)?.width ?? 0;
}

export function resizeCurrentFrameWidth(width: number): void {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const frameNode = getFrameForNode(figma.currentPage.selection[0]);

  if (frameNode && "resize" in frameNode) {
    frameNode.resize(width, frameNode.height);
  }
}
