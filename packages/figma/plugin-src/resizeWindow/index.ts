figma.clientStorage.getAsync("size").then((size) => {
  if (size) figma.ui.resize(size.width, size.height);
});

export async function resizeWindow(
  width: number,
  height: number
): Promise<void> {
  figma.ui.resize(width, height);
  await figma.clientStorage.setAsync("size", { width, height });
}
