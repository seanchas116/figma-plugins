import { InstanceInfo, TargetInfo } from "../data";
import { setInstanceInfo, getRenderedSize, getTargetInfo } from "./pluginData";
import { debounce, encodeNode } from "./common";
import { rpc } from "./rpc";
import { renderInstance } from "./render";

figma.showUI(__html__, { width: 240, height: 240 });

export const onDocumentChange = debounce((event: DocumentChangeEvent) => {
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

export const onSelectionChange = () => {
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
