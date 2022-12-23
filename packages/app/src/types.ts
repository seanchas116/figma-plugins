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
