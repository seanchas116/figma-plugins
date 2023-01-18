import { getPropertyDescriptor } from "./common";

export async function copyProperties(
  src: SceneNode,
  dst: SceneNode,
  excludedKeys: string[] = []
): Promise<void> {
  if (src.type !== dst.type) {
    throw new Error("Cannot copy properties between different node types");
  }

  if (src.type === "TEXT") {
    if (src.fontName !== figma.mixed) {
      await figma.loadFontAsync(src.fontName);
    }
  }

  if (
    "resizeWithoutConstraints" in dst &&
    !excludedKeys.includes("width") &&
    !excludedKeys.includes("height")
  ) {
    dst.resizeWithoutConstraints(src.width, src.height);
    // await Promise.resolve();
  }

  for (const key in src) {
    if (key === "id") {
      continue;
    }
    if (key === "parent") {
      continue;
    }
    if (key === "horizontalPadding") {
      continue;
    }
    if (key === "verticalPadding") {
      continue;
    }

    if (excludedKeys.includes(key)) {
      continue;
    }

    const descriptor = getPropertyDescriptor(dst, key);
    if (!descriptor || !descriptor.set) {
      continue;
    }

    // @ts-ignore
    dst[key] = src[key];
  }
}
