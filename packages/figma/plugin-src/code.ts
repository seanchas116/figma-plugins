import { ComponentState } from "../data";
import { MessageToPlugin, MessageToUI } from "../message";

figma.showUI(__html__, { width: 240, height: 240 });

function postMessageToUI(msg: MessageToUI) {
  figma.ui.postMessage(msg);
}

let targetNode: FrameNode | undefined;

figma.ui.onmessage = async (msg: MessageToPlugin) => {
  switch (msg.type) {
    case "ready": {
      onSelectionChange();
      break;
    }
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

      const componentData = msg.payload.component;

      if (componentData) {
        postMessageToUI({
          type: "render",
          payload: {
            ...componentData,
            width: node.width,
            height: node.height,
          },
        });

        targetNode.setPluginData("component", JSON.stringify(componentData));
        targetNode.setRelaunchData({
          edit: "",
        });
      } else {
        targetNode.setPluginData("component", "");
        targetNode.setRelaunchData({});
      }

      break;
    }

    case "renderDone": {
      if (targetNode) {
        const img = await figma.createImage(new Uint8Array(msg.payload.png));
        console.log(img.hash);

        targetNode.fills = [
          { type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" },
        ];
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

const onDocumentChange = debounce((event: DocumentChangeEvent) => {
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
      const componentData = node.getPluginData("component");
      if (componentData) {
        targetNode = node;
        postMessageToUI({
          type: "render",
          payload: {
            ...JSON.parse(componentData),
            width: node.width,
            height: node.height,
          },
        });
      }
    }
  }
}, 200);

const onSelectionChange = () => {
  const selection = figma.currentPage.selection;

  let componentState: ComponentState | undefined;

  if (selection.length > 0) {
    const current = selection[0];
    const data = current.getPluginData("component");
    if (data) {
      componentState = JSON.parse(data) as ComponentState;
    }
  }

  postMessageToUI({
    type: "componentChanged",
    payload: {
      component: componentState,
    },
  });
};

figma.on("documentchange", onDocumentChange);
figma.on("selectionchange", onSelectionChange);
