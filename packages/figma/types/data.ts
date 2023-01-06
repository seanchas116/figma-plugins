import type { Props } from "react-docgen-typescript";

export interface CodeComponentInfo {
  externalPath: string; // path used to import the component externally: e.g. '@uimix/components'
  internalPath: string; // path used to import the component internally: e.g. './src/components/Button'
  name: string; // export name of the component: e.g. 'Button' or 'default'
}

export function componentKey(info: CodeComponentInfo) {
  return `${info.externalPath}:${info.internalPath}#${info.name}`;
}

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
  components: CodeComponentMetadata[];
  colorStyles: Record<string, ColorStyleData>;
  textStyles: Record<string, TextStyleData>;
}

export interface RenderResult {
  png: ArrayBuffer;
  width: number;
  height: number;
}
