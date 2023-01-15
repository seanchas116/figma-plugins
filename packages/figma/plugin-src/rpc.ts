import { CodeAssets, CodeInstanceInfo } from "../types/data";
import { IPluginToUIRPC, IUIToPluginRPC } from "../types/rpc";
import { RPC } from "@uimix/typed-rpc";
import { syncAssets } from "./codeImport/syncAssets";
import { Component } from "@uimix/element-ir";
import { getComponentIRs } from "./codegen/component";
import { onSelectionChange } from "./onSelectionChange";
import { updateInstance } from "./codeImport/updateInstance";
import { createResponsivePage } from "./responsive/createResponsivePage";
import { resizeWindow } from "./resizeWindow";
import { syncResponsiveContents } from "./responsive/syncContents";

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
  async resizeWindow(width: number, height: number): Promise<void> {
    await resizeWindow(width, height);
  }

  async exportWholeDocument(): Promise<Component[]> {
    return await getComponentIRs(figma.currentPage);
  }

  async createResponsivePage(): Promise<void> {
    createResponsivePage();
  }

  async syncResponsiveContents(): Promise<void> {
    syncResponsiveContents();
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
