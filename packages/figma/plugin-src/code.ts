import { InstanceInfo, TargetInfo } from "../data";
import { MessageToPlugin } from "../message";
import { setInstanceInfo, getRenderedSize, getTargetInfo } from "./pluginData";
import { debounce, postMessageToUI } from "./common";
import { onRenderDone, renderInstance } from "./render";
import { syncAssets } from "./syncAssets";

figma.showUI(__html__, { width: 240, height: 240 });

figma.ui.onmessage = async (msg: MessageToPlugin) => {
  switch (msg.type) {
    case "ready": {
      onSelectionChange();
      break;
    }
    case "resize": {
      figma.ui.resize(msg.payload.width, msg.payload.height);
      break;
    }
    case "updateInstance": {
      console.log(msg);

      const selection = figma.currentPage.selection;
      if (!selection.length) {
        return;
      }

      const node = selection[0];
      if (node.type !== "INSTANCE") {
        return;
      }

      console.log("setting instance info", msg.payload.instance);

      const instanceInfo = msg.payload.instance;
      setInstanceInfo(node, instanceInfo);
      if (instanceInfo) {
        node.setRelaunchData({
          edit: "",
        });
        renderInstance(node);
      } else {
        node.setRelaunchData({});
      }

      break;
    }

    case "renderDone": {
      onRenderDone(msg.requestID, msg.payload);
      break;
    }

    case "syncAssets": {
      await syncAssets(msg.payload.assets);
      figma.notify("Components & tokens synced to your Figma file!");
      break;
    }
  }
};

const onDocumentChange = debounce((event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    console.log(change);
    if (
      change.type === "PROPERTY_CHANGE" &&
      change.node.type === "INSTANCE" &&
      !change.node.removed &&
      (change.properties.includes("width") ||
        change.properties.includes("height"))
    ) {
      const node = change.node;
      const target = getTargetInfo(node);
      if (!target) {
        continue;
      }

      const renderedSize = getRenderedSize(node);
      if (
        renderedSize &&
        renderedSize.width === node.width &&
        renderedSize.height === node.height
      ) {
        continue;
      }

      if (target.instance.autoResize !== "none") {
        const newAutoResize = change.properties.includes("height")
          ? "none"
          : "height";

        const newInstanceInfo: InstanceInfo = {
          ...target.instance,
          autoResize: newAutoResize,
        };

        setInstanceInfo(node, newInstanceInfo);
        postMessageToUI({
          type: "targetChanged",
          payload: {
            target: {
              ...target,
              instance: newInstanceInfo,
            },
          },
        });
      }

      renderInstance(node);
    }
  }
}, 200);

const onSelectionChange = () => {
  const selection = figma.currentPage.selection;

  let target: TargetInfo | undefined;

  if (selection.length > 0) {
    const current = selection[0];
    if (current.type === "INSTANCE") {
      target = getTargetInfo(current);
    }
  }

  postMessageToUI({
    type: "targetChanged",
    payload: {
      target,
    },
  });
};

figma.on("documentchange", onDocumentChange);
figma.on("selectionchange", onSelectionChange);
