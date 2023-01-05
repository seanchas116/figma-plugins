import { RenderResult, TargetInfo } from "../data";
import { getTargetInfo, setRenderedSize } from "./pluginData";
import { rpc } from "./rpc";

export async function renderInstanceImage(
  target: TargetInfo,
  width?: number,
  height?: number
): Promise<RenderResult> {
  const autoResize = target.instance.autoResize;

  return await rpc.remote.render(
    target.component,
    target.instance.props,
    autoResize === "widthHeight" ? undefined : width,
    autoResize !== "none" ? undefined : height
  );
}

export async function renderInstance(node: InstanceNode) {
  const target = getTargetInfo(node);
  if (!target) {
    return;
  }

  const result = await renderInstanceImage(target, node.width, node.height);

  const img = await figma.createImage(new Uint8Array(result.png));
  console.log(img.hash);

  setRenderedSize(node, {
    width: result.width,
    height: result.height,
  });
  node.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "CROP" }];
  node.resize(result.width, result.height);
}
