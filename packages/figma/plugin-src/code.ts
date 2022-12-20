import { ComponentInfo, InstanceInfo } from "../data";
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

        setInstanceInfo(targetNode, componentData);
        targetNode.setRelaunchData({
          edit: "",
        });
      } else {
        setInstanceInfo(targetNode, undefined);
        targetNode.setRelaunchData({});
      }

      break;
    }

    case "renderDone": {
      if (targetNode) {
        const img = await figma.createImage(new Uint8Array(msg.payload.png));
        console.log(img.hash);

        setRenderedSize(targetNode, {
          width: msg.payload.width,
          height: msg.payload.height,
        });
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
        component.name = componentDoc.displayName;
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
      const component = getInstanceInfo(node);
      if (!component) {
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

        setInstanceInfo(targetNode, component);
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

function setComponentInfo(
  node: ComponentNode,
  info: ComponentInfo | undefined
) {
  node.setPluginData("component", info ? JSON.stringify(info) : "");
}

function getComponentInfo(node: ComponentNode): ComponentInfo | undefined {
  const data = node.getPluginData("component");
  if (data) {
    return JSON.parse(data) as ComponentInfo;
  }
}

function setInstanceInfo(node: SceneNode, info: InstanceInfo | undefined) {
  node.setPluginData("instance", info ? JSON.stringify(info) : "");
}

function getInstanceInfo(node: SceneNode): InstanceInfo | undefined {
  const data = node.getPluginData("instance");
  if (data) {
    return JSON.parse(data) as InstanceInfo;
  }
}

interface RenderedSize {
  width: number;
  height: number;
}

function setRenderedSize(node: SceneNode, size: RenderedSize) {
  node.setPluginData("renderedSize", JSON.stringify(size));
}

function getRenderedSize(node: SceneNode): RenderedSize | undefined {
  const data = node.getPluginData("renderedSize");
  if (data) {
    return JSON.parse(data) as RenderedSize;
  }
}
