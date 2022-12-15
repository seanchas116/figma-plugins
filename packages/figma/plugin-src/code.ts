import { MessageToPlugin, MessageToUI } from "../message";

figma.showUI(__html__, { width: 240, height: 240 });

function postMessageToUI(msg: MessageToUI) {
  figma.ui.postMessage(msg);
}

let targetNode: FrameNode | undefined;

figma.ui.onmessage = async (msg: MessageToPlugin) => {
  switch (msg.type) {
    case "updateComponent": {
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

      break;
    }

    case "renderDone": {
      if (targetNode) {
        const img = await figma.createImage(new Uint8Array(msg.payload.png));
        console.log(img.hash);

        targetNode.fills = [
          { type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" },
        ];

        targetNode.setPluginData("mark", "true");
        console.log("relaunchData");
        targetNode.setRelaunchData({
          edit: "",
        });
      }

      break;
    }
  }
};

const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout | undefined;
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
}, 200);

figma.on("documentchange", onChange);
