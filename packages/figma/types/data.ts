import type { Props } from "react-docgen-typescript";
import { Element } from "@uimix/element-ir";

export interface CodeComponentInfo {
  externalPath: string; // path used to import the component externally: e.g. '@uimix/components'
  internalPath: string; // path used to import the component internally: e.g. './src/components/Button'
  name: string; // export name of the component: e.g. 'Button' or 'default'
}

export const CodeComponentInfo = {
  key(info: CodeComponentInfo) {
    return `${info.externalPath}:${info.internalPath}#${info.name}`;
  },
};

export interface CodeInstanceParams {
  props: Record<string, any>;
  autoResize: "none" | "height" | "widthHeight"; // same as Figma text nodes
}

export interface CodeInstanceInfo extends CodeInstanceParams {
  component: CodeComponentInfo;
}

export interface CodeComponentMetadata extends CodeComponentInfo {
  props: Props;
}

export interface CodeColorStyle {
  value: string;
  comment?: string;
}

export interface CodeTextStyle {
  value: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight?: number;
    letterSpacing?: number;
  };
  comment?: string;
}

export interface CodeAssets {
  components: CodeComponentMetadata[];
  colorStyles: Record<string, CodeColorStyle>;
  textStyles: Record<string, CodeTextStyle>;
}

export interface RenderResult {
  png: ArrayBuffer;
  width: number;
  height: number;
}

export interface ResponsiveViewportInfo {
  width: number;
}

export interface Target {
  instance?: CodeInstanceInfo;
  icon?: IconInfo;
  responsiveViewport?: ResponsiveViewportInfo;
  elementIR: Element[];
}

export interface DropMetadata {
  type: "icon";
  icon: IconInfo;
}

export interface IconInfo {
  name: string;
  source: "iconify";
  props?: { hFlip?: boolean; vFlip?: boolean; rotate?: number };
}
