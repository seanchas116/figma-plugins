import { CodeInstanceInfo } from "../../types/data";
import { onSelectionChange } from "../onSelectionChange";
import {
  getInstanceInfo,
  getRenderedSize,
  setInstanceParams,
} from "../pluginData";
import { debounce } from "../util/common";
import { renderInstance } from "./render";

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

const onDocumentChange = debounce(async (event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    handleCodeInstanceResize(change);
  }
}, 200);

figma.on("documentchange", onDocumentChange);
