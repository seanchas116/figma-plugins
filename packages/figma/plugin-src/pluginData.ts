import {
  CodeComponentInfo,
  CodeInstanceInfo,
  CodeInstanceParams,
  IconInfo,
} from "../types/data";
import type { IconCustomisations } from "@iconify/search-core/lib/misc/customisations";
import { omit } from "./util/common";

export function setComponentInfo(
  node: ComponentNode,
  info: CodeComponentInfo | undefined
) {
  node.setPluginData("component", info ? JSON.stringify(info) : "");
}

export function getComponentInfo(
  node: ComponentNode | InstanceNode
): CodeComponentInfo | undefined {
  const data = node.getPluginData("component");
  if (data) {
    return JSON.parse(data) as CodeComponentInfo;
  }
}

export function setInstanceParams(
  node: InstanceNode,
  info: CodeInstanceParams | undefined
) {
  const params: CodeInstanceParams | undefined = info && {
    props: info.props,
    autoResize: info.autoResize,
  };

  node.setPluginData("instance", params ? JSON.stringify(params) : "");
}

export function getInstanceInfo(
  node: InstanceNode
): CodeInstanceInfo | undefined {
  if (!node.mainComponent) {
    return;
  }

  const component = getComponentInfo(node);
  if (!component) {
    return;
  }

  const data = node.getPluginData("instance");
  if (data) {
    const params = JSON.parse(data) as CodeInstanceParams;
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

export function setResponsiveID(node: SceneNode, id: string) {
  node.setPluginData("responsiveID", id);
}

export function getResponsiveID(node: SceneNode): string | undefined {
  return node.getPluginData("responsiveID") || undefined;
}

export function getOrGenerateResponsiveID(node: SceneNode): string {
  const id = getResponsiveID(node);
  if (id) {
    return id;
  }

  const newId = node.id;
  setResponsiveID(node, newId);
  return newId;
}

interface IconPluginData extends IconInfo {
  version: 1;
}

export function setIconPluginData(node: SceneNode, data: IconPluginData) {
  node.setPluginData("icon", JSON.stringify(data));
}

export function getIconPluginData(node: SceneNode): IconPluginData | undefined {
  const data = node.getPluginData("icon");
  if (data) {
    return JSON.parse(data) as IconPluginData;
  }
}

export interface IconifyImportedIconSharedData {
  version: 2;
  name: string;
  props?: Partial<IconCustomisations>;
}

export function getIconInfo(node: SceneNode): IconInfo | undefined {
  const iconData = getIconPluginData(node);
  if (iconData) {
    return omit(iconData, ["version"]);
  }

  const iconifyIconDataText = node.getSharedPluginData("iconify", "props");
  if (iconifyIconDataText) {
    const iconifyIconData = JSON.parse(
      iconifyIconDataText
    ) as IconifyImportedIconSharedData;
    if (iconifyIconData.version === 2) {
      return {
        name: iconifyIconData.name,
        source: "iconify",
        props: iconifyIconData.props,
      };
    }
  }
}
