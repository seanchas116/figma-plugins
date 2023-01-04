import type { Props } from "react-docgen-typescript";

export interface InstanceInfo {
  props: Record<string, any>;
  autoResize: "none" | "height" | "widthHeight"; // same as Figma text nodes
}

export interface ComponentInfo {
  path: string;
  name: string;
}

export interface TargetInfo {
  component: ComponentInfo;
  instance: InstanceInfo;
}

export interface ComponentMetadata extends ComponentInfo {
  props: Props;
}

export interface ColorStyleData {
  value: string;
  comment?: string;
}

export interface TextStyleData {
  value: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight?: number;
    letterSpacing?: number;
  };
  comment?: string;
}

export interface Assets {
  components: ComponentMetadata[];
  colorStyles: Record<string, ColorStyleData>;
  textStyles: Record<string, TextStyleData>;
}
