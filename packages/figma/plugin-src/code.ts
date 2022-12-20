import { InstanceInfo } from "../data";
import { MessageToPlugin, MessageToUI } from "../message";
import {
  setInstanceInfo,
  getComponentInfo,
  setComponentInfo,
  getInstanceInfo,
  getRenderedSize,
  setRenderedSize,
} from "./pluginData";
import { debounce } from "./util";

figma.showUI(__html__, { width: 240, height: 200 });

function postMessageToUI(msg: MessageToUI) {
  figma.ui.postMessage(msg);
}

interface RenderResult {
  png: ArrayBuffer;
  width: number;
  height: number;
}

const renderCallbacks = new Map<number, (payload: RenderResult) => void>();

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
      const callback = renderCallbacks.get(msg.requestID);
      if (callback) {
        renderCallbacks.delete(msg.requestID);
        callback(msg.payload);
      }

      break;
    }

    case "syncAssets": {
      // TODO: generate components

      let page = figma.root.findChild(
        (page) => page.name === "Component Catalog"
      );
      if (!page) {
        page = figma.createPage();
        page.name = "Component Catalog";
      }

      const components = new Map<string, ComponentNode>();
      for (const node of page.children) {
        if (node.type === "COMPONENT") {
          const info = getComponentInfo(node);
          if (info) {
            components.set(info.path + "#" + info.name, node);
          }
        }
      }

      for (const componentDoc of msg.payload.componentDocs || []) {
        const key = componentDoc.filePath + "#" + componentDoc.displayName;
        let component = components.get(key);
        if (!component) {
          component = figma.createComponent();
          setComponentInfo(component, {
            path: componentDoc.filePath,
            name: componentDoc.displayName,
          });
          page.appendChild(component);
        }

        component.resize(100, 100);

        const result = await renderInstanceImage({
          path: componentDoc.filePath,
          name: componentDoc.displayName,
          props: {},
          autoResize: "none",
        });

        const img = await figma.createImage(new Uint8Array(result.png));
        component.fills = [
          { type: "IMAGE", imageHash: img.hash, scaleMode: "CROP" },
        ];
        component.resize(result.width, result.height);

        component.name = componentDoc.displayName;
      }

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
      change.node.type === "FRAME" &&
      !change.node.removed &&
      (change.properties.includes("width") ||
        change.properties.includes("height"))
    ) {
      const node = change.node;
      const instanceInfo = getInstanceInfo(node);
      if (!instanceInfo) {
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

      if (instanceInfo.autoResize !== "none") {
        const newAutoResize = change.properties.includes("height")
          ? "none"
          : "height";

        const newInstanceInfo: InstanceInfo = {
          ...instanceInfo,
          autoResize: newAutoResize,
        };

        setInstanceInfo(node, newInstanceInfo);
        postMessageToUI({
          type: "instanceChanged",
          payload: {
            instance: newInstanceInfo,
          },
        });
      }

      renderInstance(node);
    }
  }
}, 200);

const onSelectionChange = () => {
  const selection = figma.currentPage.selection;

  let componentState: InstanceInfo | undefined;

  if (selection.length > 0) {
    const current = selection[0];
    componentState = getInstanceInfo(current);
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

async function renderInstanceImage(
  instanceInfo: InstanceInfo,
  width?: number,
  height?: number
): Promise<RenderResult> {
  const requestID = Math.random();

  const autoResize = instanceInfo.autoResize;

  postMessageToUI({
    type: "render",
    requestID,
    payload: {
      ...instanceInfo,
      width: autoResize === "widthHeight" ? undefined : width,
      height: autoResize !== "none" ? undefined : height,
    },
  });

  return new Promise<RenderResult>((resolve) => {
    renderCallbacks.set(requestID, resolve);
  });
}

async function renderInstance(node: FrameNode) {
  const instanceInfo = getInstanceInfo(node);
  if (!instanceInfo) {
    return;
  }

  const result = await renderInstanceImage(
    instanceInfo,
    node.width,
    node.height
  );

  const img = await figma.createImage(new Uint8Array(result.png));
  console.log(img.hash);

  setRenderedSize(node, {
    width: result.width,
    height: result.height,
  });
  node.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "CROP" }];
  node.resize(result.width, result.height);
}
