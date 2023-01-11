import { CodeAssets, CodeInstanceInfo, Target } from "../types/data";
import {
  setInstanceParams,
  getRenderedSize,
  getInstanceInfo,
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

const onDocumentChange = debounce((event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    console.info(change);
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

        onSelectionChange();
      }

      renderInstance(node);
    }
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
