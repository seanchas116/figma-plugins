import { CodeAssets, CodeInstanceInfo, Target } from "../types/data";
import {
  setInstanceParams,
  getRenderedSize,
  getInstanceInfo,
  setResponsiveFrameData,
  getResponsiveFrameData,
  getResponsiveID,
  setResponsiveID,
} from "./pluginData";
import { debounce } from "./common";
import { renderInstance } from "./render";
import { IPluginToUIRPC, IUIToPluginRPC } from "../types/rpc";
import { RPC } from "@uimix/typed-rpc";
import { syncAssets } from "./syncAssets";
import { getElementIR } from "./codegen/element";
import { Component } from "@uimix/element-ir";
import { getComponentIRs } from "./codegen/component";

figma.clientStorage.getAsync("size").then((size) => {
  if (size) figma.ui.resize(size.width, size.height);
});

figma.showUI(__html__, { width: 240, height: 240 });

function handleCodeInstanceResize(change: DocumentChange) {
  if (
    change.type === "PROPERTY_CHANGE" &&
    change.node.type === "INSTANCE" &&
    !change.node.removed &&
    (change.properties.includes("width") ||
      change.properties.includes("height"))
  ) {
    const node = change.node;
    const instance = getInstanceInfo(node);
    if (!instance) {
      return;
    }

    const renderedSize = getRenderedSize(node);
    if (
      renderedSize &&
      renderedSize.width === node.width &&
      renderedSize.height === node.height
    ) {
      return;
    }

    if (instance.autoResize !== "none") {
      const newAutoResize = change.properties.includes("height")
        ? "none"
        : "height";

      const newInstanceInfo: CodeInstanceInfo = {
        ...instance,
        autoResize: newAutoResize,
      };

      setInstanceParams(node, newInstanceInfo);

      onSelectionChange();
    }

    renderInstance(node);
  }
}

async function handleResponsiveContentChange(change: DocumentChange) {
  console.log(change);

  if (change.type === "DELETE") {
    const nodes = figma.root.findAll(
      (node) => node.type !== "PAGE" && getResponsiveID(node) === change.node.id
    );
    for (const node of nodes) {
      node.remove();
    }
    return;
  }

  if (change.type === "CREATE" || change.type === "PROPERTY_CHANGE") {
    const node = change.node;
    if (node.removed) {
      return;
    }

    const parent = node.parent;

    if (parent?.type !== "FRAME") {
      return;
    }
    const parentData = getResponsiveFrameData(parent);
    if (!parentData || parentData.maxWidth) {
      return;
    }

    const otherParents = (parent.parent?.children.filter(
      (child) =>
        child.type === "FRAME" &&
        getResponsiveFrameData(child) &&
        child !== parent
    ) ?? []) as FrameNode[];

    for (const otherParent of otherParents) {
      console.log("original", node.id);
      let clone = otherParent.children.find((child) => {
        return getResponsiveID(child) === node.id;
      }) as SceneNode | undefined;

      if (!clone) {
        clone = node.clone();
        setResponsiveID(clone, node.id);
        otherParent.appendChild(clone);
      }

      if (change.type === "PROPERTY_CHANGE") {
        for (const property of change.properties) {
          if (node.type === "TEXT" && clone.type === "TEXT") {
            await figma.loadFontAsync(node.fontName as FontName);
            clone.characters = node.characters;
            clone.x = node.x;
            clone.y = node.y;
            clone.fontSize = node.fontSize;
            clone.resizeWithoutConstraints(node.width, node.height);
          }
          if (node.type === "RECTANGLE" && clone.type === "RECTANGLE") {
            clone.x = node.x;
            clone.y = node.y;
            clone.resizeWithoutConstraints(node.width, node.height);
          }
        }
      }
    }
  }
}

const onDocumentChange = debounce(async (event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    handleCodeInstanceResize(change);
    await handleResponsiveContentChange(change);
  }
}, 200);

const onSelectionChange = async () => {
  const selection = figma.currentPage.selection;

  const targets = await Promise.all(
    selection.map(async (node): Promise<Target> => {
      let instance: CodeInstanceInfo | undefined;
      if (node.type === "INSTANCE") {
        instance = getInstanceInfo(node);
      }

      return {
        instance,
        elementIR: await getElementIR(node),
      };
    })
  );

  rpc.remote.onTargetsChange(targets);
};

figma.on("documentchange", onDocumentChange);
figma.on("selectionchange", onSelectionChange);

class RPCHandler implements IUIToPluginRPC {
  async ready(): Promise<void> {
    onSelectionChange();
  }
  async updateInstance(instance?: CodeInstanceInfo | undefined): Promise<void> {
    const selection = figma.currentPage.selection;
    if (!selection.length) {
      return;
    }

    const node = selection[0];
    if (node.type !== "INSTANCE") {
      return;
    }

    const instanceInfo = instance;
    setInstanceParams(node, instanceInfo);
    if (instanceInfo) {
      node.setRelaunchData({
        edit: "",
      });
      renderInstance(node);
    } else {
      node.setRelaunchData({});
    }
  }
  async syncCodeAssets(assets: CodeAssets): Promise<void> {
    await syncAssets(assets);
    figma.notify("Components & tokens synced to your Figma file!");
  }
  async resize(width: number, height: number): Promise<void> {
    figma.ui.resize(width, height);
    figma.clientStorage.setAsync("size", { width, height });
  }

  async exportWholeDocument(): Promise<Component[]> {
    return await getComponentIRs(figma.currentPage);
  }

  async createResponsivePage(): Promise<void> {
    const topLeft = {
      x: figma.viewport.bounds.x + 100,
      y: figma.viewport.bounds.y + 100,
    };

    const gap = 32;

    const section = figma.createSection();
    section.name = "Page";
    section.x = topLeft.x;
    section.y = topLeft.y;

    const desktop = figma.createFrame();
    desktop.name = "Desktop";
    desktop.x = gap;
    desktop.y = gap;
    desktop.resize(1440, 1080);
    setResponsiveFrameData(desktop, {});

    section.appendChild(desktop);

    const mobile = figma.createFrame();
    mobile.name = "Mobile";
    mobile.x = gap + desktop.width + gap;
    mobile.y = gap;
    mobile.resize(375, 812);
    setResponsiveFrameData(mobile, {
      maxWidth: 375,
    });

    section.appendChild(mobile);

    section.resizeWithoutConstraints(
      desktop.width + mobile.width + gap * 3,
      Math.max(desktop.height, mobile.height) + gap * 2
    );
  }
}

export const rpc = new RPC<IUIToPluginRPC, IPluginToUIRPC>({
  post: (msg) => {
    figma.ui.postMessage(msg);
  },
  subscribe: (handler) => {
    figma.ui.onmessage = handler;
    return () => {
      figma.ui.onmessage = undefined;
    };
  },
  handler: new RPCHandler(),
});
