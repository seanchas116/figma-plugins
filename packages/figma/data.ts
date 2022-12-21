import type { ComponentDoc } from "react-docgen-typescript";

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

export interface TextStyleData {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight?: number;
  letterSpacing?: number;
}

export interface Assets {
  components: ComponentDoc[];
  colorStyles: Record<string, string>;
  textStyles: Record<string, TextStyleData>;
}
