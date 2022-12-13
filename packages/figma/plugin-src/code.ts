import { MessageToPlugin, MessageToUI } from "../message";

figma.showUI(__html__, { width: 240, height: 240 });

function postMessageToUI(msg: MessageToUI) {
  figma.ui.postMessage(msg);
}

let targetNode: FrameNode | undefined;

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

    targetNode = node;

    postMessageToUI({
      type: "render",
      width: node.width,
      height: node.height,
    });
  } else if (msg.type === "renderFinish") {
    if (targetNode) {
      const img = await figma.createImage(new Uint8Array(msg.payload));
      console.log(img.hash);

      targetNode.fills = [
        { type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" },
      ];
    }
  }
};
