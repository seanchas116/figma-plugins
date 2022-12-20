import { ComponentInfo, InstanceInfo } from "../data";

export function setComponentInfo(
  node: ComponentNode,
  info: ComponentInfo | undefined
) {
  node.setPluginData("component", info ? JSON.stringify(info) : "");
}

export function getComponentInfo(
  node: ComponentNode
): ComponentInfo | undefined {
  const data = node.getPluginData("component");
  if (data) {
    return JSON.parse(data) as ComponentInfo;
  }
}

export function setInstanceInfo(
  node: SceneNode,
  info: InstanceInfo | undefined
) {
  node.setPluginData("instance", info ? JSON.stringify(info) : "");
}

export function getInstanceInfo(node: SceneNode): InstanceInfo | undefined {
  const data = node.getPluginData("instance");
  if (data) {
    return JSON.parse(data) as InstanceInfo;
  }
}

export interface RenderedSize {
  width: number;
  height: number;
}

export function setRenderedSize(node: SceneNode, size: RenderedSize) {
  node.setPluginData("renderedSize", JSON.stringify(size));
}

export function getRenderedSize(node: SceneNode): RenderedSize | undefined {
  const data = node.getPluginData("renderedSize");
  if (data) {
    return JSON.parse(data) as RenderedSize;
  }
}
