import { RenderResult, CodeInstanceInfo } from "../types/data";
import { getInstanceInfo, setRenderedSize } from "./pluginData";
import { rpc } from "./code";

export async function renderInstanceImage(
  instance: CodeInstanceInfo,
  width?: number,
  height?: number
): Promise<RenderResult> {
  const autoResize = instance.autoResize;

  return await rpc.remote.renderCodeComponent(
    instance.component,
    instance.props,
    autoResize === "widthHeight" ? undefined : width,
    autoResize !== "none" ? undefined : height
  );
}

export async function renderInstance(node: InstanceNode) {
  const instance = getInstanceInfo(node);
  if (!instance) {
    return;
  }

  const result = await renderInstanceImage(instance, node.width, node.height);

  const img = await figma.createImage(new Uint8Array(result.png));
  console.log(img.hash);

  setRenderedSize(node, {
    width: result.width,
    height: result.height,
  });
  node.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "CROP" }];
  node.resize(result.width, result.height);
}
