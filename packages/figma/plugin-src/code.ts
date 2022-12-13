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

      targetNode.setPluginData("mark", "true");
    }
  }
};

const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: number | undefined;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = undefined;
    }, delay);
  };
};

const onChange = debounce((event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    console.log(change);
    if (
      change.type === "PROPERTY_CHANGE" &&
      change.node.type === "FRAME" &&
      !change.node.removed &&
      (change.properties.includes("width") ||
        change.properties.includes("height"))
    ) {
      const node = change.node;
      if (node.getPluginData("mark") === "true") {
        targetNode = node;
        postMessageToUI({
          type: "render",
          width: node.width,
          height: node.height,
        });
      }
    }
  }
}, 500);

figma.on("documentchange", onChange);
