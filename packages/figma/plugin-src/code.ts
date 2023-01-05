import { Assets, InstanceInfo, TargetInfo } from "../data";
import { setInstanceInfo, getRenderedSize, getTargetInfo } from "./pluginData";
import { debounce, encodeNode } from "./common";
import { renderInstance } from "./render";
import { IPluginToUIRPC, IUIToPluginRPC } from "../rpc";
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

        rpc.remote.onTargetChange({
          ...target,
          instance: newInstanceInfo,
        });
      }

      renderInstance(node);
    }
  }
}, 200);

const onSelectionChange = () => {
  const selection = figma.currentPage.selection;

  console.log(selection, selection.map(encodeNode));

  let target: TargetInfo | undefined;

  if (selection.length > 0) {
    const current = selection[0];
    if (current.type === "INSTANCE") {
      target = getTargetInfo(current);
    }
  }

  rpc.remote.onTargetChange(target);
};

figma.on("documentchange", onDocumentChange);
figma.on("selectionchange", onSelectionChange);

class RPCHandler implements IUIToPluginRPC {
  async ready(): Promise<void> {
    onSelectionChange();
  }
  async updateInstance(instance?: InstanceInfo | undefined): Promise<void> {
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
    setInstanceInfo(node, instanceInfo);
    if (instanceInfo) {
      node.setRelaunchData({
        edit: "",
      });
      renderInstance(node);
    } else {
      node.setRelaunchData({});
    }
  }
  async syncAssets(assets: Assets): Promise<void> {
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
