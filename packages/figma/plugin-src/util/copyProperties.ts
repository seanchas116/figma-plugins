export function copyProperties(src: SceneNode, dst: SceneNode): void {
  if (src.type !== dst.type) {
    throw new Error("Cannot copy properties between different node types");
  }

  throw new Error("Not implemented");
}
