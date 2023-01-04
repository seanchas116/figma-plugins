import { TargetInfo } from "../data";
import { postMessageToUI } from "./common";
import { setRenderedSize, getTargetInfo } from "./pluginData";

interface RenderResult {
  png: ArrayBuffer;
  width: number;
  height: number;
}

const renderCallbacks = new Map<number, (payload: RenderResult) => void>();

export function onRenderDone(requestID: number, payload: RenderResult) {
  const callback = renderCallbacks.get(requestID);
  if (callback) {
    renderCallbacks.delete(requestID);
    callback(payload);
  }
}

export async function renderInstanceImage(
  target: TargetInfo,
  width?: number,
  height?: number
): Promise<RenderResult> {
  const requestID = Math.random();

  const autoResize = target.instance.autoResize;

  postMessageToUI({
    type: "render",
    requestID,
    payload: {
      component: target.component,
      ...target.instance,
      width: autoResize === "widthHeight" ? undefined : width,
      height: autoResize !== "none" ? undefined : height,
    },
  });

  return new Promise<RenderResult>((resolve) => {
    renderCallbacks.set(requestID, resolve);
  });
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
