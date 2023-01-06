import { CodeAssets, CodeInstanceInfo } from "../types/data";
import {
  setInstanceParams,
  getRenderedSize,
  getInstanceInfo,
} from "./pluginData";
import { debounce, encodeNode } from "./common";
import { renderInstance } from "./render";
import { IPluginToUIRPC, IUIToPluginRPC } from "../types/rpc";
import { RPC } from "@uimix/typed-rpc";
import { syncAssets } from "./syncAssets";

figma.showUI(__html__, { width: 240, height: 240 });

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
      const instance = getInstanceInfo(node);
      if (!instance) {
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

      if (instance.autoResize !== "none") {
        const newAutoResize = change.properties.includes("height")
          ? "none"
          : "height";

        const newInstanceInfo: CodeInstanceInfo = {
          ...instance,
          autoResize: newAutoResize,
        };

        setInstanceParams(node, newInstanceInfo);

        rpc.remote.onTargetChange(newInstanceInfo);
      }

      renderInstance(node);
    }
  }
}, 200);

const onSelectionChange = () => {
  const selection = figma.currentPage.selection;

  console.log(selection, selection.map(encodeNode));

  let instance: CodeInstanceInfo | undefined;

  if (selection.length > 0) {
    const current = selection[0];
    if (current.type === "INSTANCE") {
      instance = getInstanceInfo(current);
    }
  }

  rpc.remote.onTargetChange(instance);
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

    console.log("setting instance info", instance);

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
