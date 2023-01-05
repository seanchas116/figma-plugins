import { ComponentInfo, InstanceInfo, TargetInfo } from "../types/data";

export function setComponentInfo(
  node: ComponentNode,
  info: ComponentInfo | undefined
) {
  node.setPluginData("component", info ? JSON.stringify(info) : "");
}

export function getComponentInfo(
  node: ComponentNode | InstanceNode
): ComponentInfo | undefined {
  const data = node.getPluginData("component");
  if (data) {
    return JSON.parse(data) as ComponentInfo;
  }
}

export function setInstanceInfo(
  node: InstanceNode,
  info: InstanceInfo | undefined
) {
  node.setPluginData("instance", info ? JSON.stringify(info) : "");
}

export function getInstanceInfo(node: InstanceNode): InstanceInfo | undefined {
  if (!node.mainComponent) {
    return;
  }

  const data = node.getPluginData("instance");
  if (data) {
    return JSON.parse(data) as InstanceInfo;
  }

  const componentInfo = getComponentInfo(node);
  if (componentInfo) {
    return {
      props: {},
      autoResize: "widthHeight",
    };
  }
}

export function getTargetInfo(node: InstanceNode): TargetInfo | undefined {
  const instance = getInstanceInfo(node);
  const component = getComponentInfo(node); // from main component
  if (instance && component) {
    return {
      instance,
      component,
    };
  }
}

export interface RenderedSize {
  width: number;
  height: number;
}

export function setRenderedSize(node: InstanceNode, size: RenderedSize) {
  node.setPluginData("renderedSize", JSON.stringify(size));
}

export function getRenderedSize(node: InstanceNode): RenderedSize | undefined {
  const data = node.getPluginData("renderedSize");
  if (data) {
    return JSON.parse(data) as RenderedSize;
  }
}

export interface PaintStyleMetadata {
  name: string;
}

export function setPaintStyleMetadata(
  node: PaintStyle,
  metadata: PaintStyleMetadata
) {
  node.setPluginData("metadata", JSON.stringify(metadata));
}

export function getPaintStyleMetadata(
  node: PaintStyle
): PaintStyleMetadata | undefined {
  const data = node.getPluginData("metadata");
  if (data) {
    return JSON.parse(data) as PaintStyleMetadata;
  }
}

export interface TextStyleMetadata {
  name: string;
}

export function setTextStyleMetadata(
  node: TextStyle,
  metadata: TextStyleMetadata
) {
  node.setPluginData("metadata", JSON.stringify(metadata));
}

export function getTextStyleMetadata(
  node: TextStyle
): TextStyleMetadata | undefined {
  const data = node.getPluginData("metadata");
  if (data) {
    return JSON.parse(data) as TextStyleMetadata;
  }
}
