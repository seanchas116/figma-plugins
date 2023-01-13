import { CodeAssets, CodeInstanceInfo } from "../types/data";
import { setResponsiveFrameData } from "./pluginData";
import { debounce } from "./common";
import { IPluginToUIRPC, IUIToPluginRPC } from "../types/rpc";
import { RPC } from "@uimix/typed-rpc";
import { syncAssets } from "./codeImport/syncAssets";
import { Component } from "@uimix/element-ir";
import { getComponentIRs } from "./codegen/component";
import { onSelectionChange } from "./onSelectionChange";
import { handleCodeInstanceResize } from "./codeImport/handleCodeInstanceResize";
import { updateInstance } from "./codeImport/updateInstance";
import { handleResponsiveContentChange } from "./responsive/handleResponsiveContentChange";
import { createResponsivePage } from "./responsive/createResponsivePage";

figma.clientStorage.getAsync("size").then((size) => {
  if (size) figma.ui.resize(size.width, size.height);
});

figma.showUI(__html__, { width: 240, height: 240 });

const onDocumentChange = debounce(async (event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    handleCodeInstanceResize(change);
    await handleResponsiveContentChange(change);
  }
}, 200);

figma.on("documentchange", onDocumentChange);
figma.on("selectionchange", onSelectionChange);

class RPCHandler implements IUIToPluginRPC {
  async ready(): Promise<void> {
    onSelectionChange();
  }
  async updateInstance(instance?: CodeInstanceInfo | undefined): Promise<void> {
    updateInstance(instance);
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
    createResponsivePage();
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
