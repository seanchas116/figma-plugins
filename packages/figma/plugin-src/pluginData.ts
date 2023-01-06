import { ComponentInfo, InstanceInfo, InstanceParams } from "../types/data";

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

export function setInstanceParams(
  node: InstanceNode,
  info: InstanceParams | undefined
) {
  const params: InstanceParams | undefined = info && {
    props: info.props,
    autoResize: info.autoResize,
  };

  node.setPluginData("instance", params ? JSON.stringify(params) : "");
}

export function getInstanceInfo(node: InstanceNode): InstanceInfo | undefined {
  if (!node.mainComponent) {
    return;
  }

  const component = getComponentInfo(node);
  if (!component) {
    return;
  }

  const data = node.getPluginData("instance");
  if (data) {
    const params = JSON.parse(data) as InstanceParams;
    return {
      ...params,
      component,
    };
  } else {
    return {
      props: {},
      autoResize: "widthHeight",
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
