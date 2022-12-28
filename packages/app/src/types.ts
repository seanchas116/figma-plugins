import { ComponentDoc } from "react-docgen-typescript";

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
  components: ComponentDoc[];
  colorStyles: Record<string, ColorStyleData>;
  textStyles: Record<string, TextStyleData>;
}
