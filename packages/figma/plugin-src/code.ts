import { MessageToPlugin, MessageToUI } from "../message";

figma.showUI(__html__, { width: 240, height: 240 });

figma.ui.onmessage = async (msg: MessageToPlugin) => {
  if (msg.type === "renderStart") {
    console.log(msg);

    const selection = figma.currentPage.selection;
    if (!selection.length) {
      return;
    }

    const node = selection[0];
    if (node.type !== "FRAME") {
      return;
    }

    figma.ui.postMessage({
      type: "render",
      width: node.width,
      height: node.height,
    } as MessageToUI);
  } else if (msg.type === "renderFinish") {
    console.log(msg.payload);

    const selection = figma.currentPage.selection;
    if (!selection.length) {
      return;
    }

    const node = selection[0];
    if (node.type !== "FRAME") {
      return;
    }

    const img = await figma.createImage(new Uint8Array(msg.payload));
    console.log(img.hash);

    node.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" }];
  }
};
