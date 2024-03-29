import { CodeAssets, CodeInstanceInfo, IconInfo } from "../types/data";
import { IPluginToUIRPC, IUIToPluginRPC } from "../types/rpc";
import { RPC } from "@uimix/typed-rpc";
import { syncAssets } from "./codeImport/syncAssets";
import { Component } from "@uimix/element-ir";
import { getComponentIRs } from "./codegen/component";
import { onSelectionChange } from "./onSelectionChange";
import { updateInstance } from "./codeImport/updateInstance";
import { resizeWindow } from "./resizeWindow";
import { insertIcon } from "./icon/insertIcon";
import {
  clearCurrentArtboardResponsive,
  makeCurrentArtboardResponsive,
  resizeCurrentArtboardWidth,
} from "./responsive/actions";
import * as simpleResponsive from "./simpleResponsive";

class RPCHandler implements IUIToPluginRPC {
  async ready(): Promise<void> {
    await onSelectionChange();
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async updateInstance(instance?: CodeInstanceInfo | undefined): Promise<void> {
    await updateInstance(instance);
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

  // // eslint-disable-next-line @typescript-eslint/require-await
  // async createResponsivePage(): Promise<void> {
  //   createResponsivePage();
  // }

  // async syncResponsiveContents(): Promise<void> {
  //   await syncResponsiveContents();
  // }

  async getClientStorage(key: string): Promise<any> {
    return await figma.clientStorage.getAsync(key);
  }
  async setClientStorage(key: string, value: any): Promise<void> {
    await figma.clientStorage.setAsync(key, value);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async notify(message: string): Promise<void> {
    figma.notify(message);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async insertIcon(svgText: string, icon: IconInfo): Promise<void> {
    insertIcon(svgText, icon);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async resizeCurrentArtboardWidth(width: number): Promise<void> {
    resizeCurrentArtboardWidth(width);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async makeCurrentArtboardResponsive(): Promise<void> {
    makeCurrentArtboardResponsive();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async clearCurrentArtboardResponsive(): Promise<void> {
    clearCurrentArtboardResponsive();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async copyStylesToLargerScreens(): Promise<void> {
    //copyStylesToLargerScreens();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async copyStylesToSmallerScreens(): Promise<void> {
    //copyStylesToSmallerScreens();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async simpleResponsiveCreateComponent(): Promise<void> {
    simpleResponsive.createResponsivePage();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async simpleResponsiveSync(): Promise<void> {
    simpleResponsive.syncResponsiveContents();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async simpleResponsiveCopyToWider(): Promise<void> {
    simpleResponsive.copyStylesToLargerScreens();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async simpleResponsiveCopyToNarrower(): Promise<void> {
    simpleResponsive.copyStylesToSmallerScreens();
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
