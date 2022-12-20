import { InstanceInfo } from "../data";
import { MessageToPlugin, MessageToUI } from "../message";

figma.showUI(__html__, { width: 240, height: 200 });

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
    case "updateInstance": {
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

      const componentData = msg.payload.instance;

      if (componentData) {
        const autoResize = componentData.autoResize;

        postMessageToUI({
          type: "render",
          payload: {
            ...componentData,
            width: autoResize === "widthHeight" ? undefined : node.width,
            height: autoResize !== "none" ? undefined : node.height,
          },
        });

        targetNode.setPluginData("instance", JSON.stringify(componentData));
        targetNode.setRelaunchData({
          edit: "",
        });
      } else {
        targetNode.setPluginData("instance", "");
        targetNode.setRelaunchData({});
      }

      break;
    }

    case "renderDone": {
      if (targetNode) {
        const img = await figma.createImage(new Uint8Array(msg.payload.png));
        console.log(img.hash);

        targetNode.setPluginData(
          "renderedSize",
          JSON.stringify({
            width: msg.payload.width,
            height: msg.payload.height,
          })
        );

        targetNode.fills = [
          { type: "IMAGE", imageHash: img.hash, scaleMode: "CROP" },
        ];
        targetNode.resize(msg.payload.width, msg.payload.height);
      }

      break;
    }

    case "syncAssets": {
      // TODO: generate components

      let page = figma.root.findChild(
        (page) => page.name === "Component Catalog"
      );
      if (!page) {
        const page = figma.createPage();
        page.name = "Component Catalog";
      }

      for (const componentDoc of msg.payload.componentDocs || []) {
        const component = figma.createComponent();
        component.name = componentDoc.displayName;
        component.resize(100, 100);
        component.setPluginData("instance", JSON.stringify(componentDoc));

        page!.appendChild(component);
      }

      figma.notify("Components & tokens synced to your Figma file!");
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
      const componentData = node.getPluginData("instance");
      const renderedSizeData = node.getPluginData("renderedSize");

      if (!componentData) {
        continue;
      }
      const component = JSON.parse(componentData) as InstanceInfo;

      if (renderedSizeData) {
        const renderedSize = JSON.parse(renderedSizeData) as {
          width: number;
          height: number;
        };
        if (
          renderedSize.width === node.width &&
          renderedSize.height === node.height
        ) {
          continue;
        }
      }

      targetNode = node;
      postMessageToUI({
        type: "render",
        payload: {
          ...component,
          width: node.width,
          height: node.height,
        },
      });

      if (component.autoResize !== "none") {
        const newAutoResize = change.properties.includes("height")
          ? "none"
          : "height";

        targetNode.setPluginData("instance", JSON.stringify(component));
        postMessageToUI({
          type: "instanceChanged",
          payload: {
            instance: {
              ...component,
              autoResize: newAutoResize,
            },
          },
        });
      }
    }
  }
}, 200);

const onSelectionChange = () => {
  const selection = figma.currentPage.selection;

  let componentState: InstanceInfo | undefined;

  if (selection.length > 0) {
    const current = selection[0];
    const data = current.getPluginData("instance");
    if (data) {
      componentState = JSON.parse(data) as InstanceInfo;
    }
  }

  postMessageToUI({
    type: "instanceChanged",
    payload: {
      instance: componentState,
    },
  });
};

figma.on("documentchange", onDocumentChange);
figma.on("selectionchange", onSelectionChange);
