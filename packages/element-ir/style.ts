export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface SolidPaint {
  type: "solid";
  color: Color;
}

export interface Vector {
  x: number;
  y: number;
}

export interface ColorStop {
  position: number;
  color: Color;
}

export interface GradientPaint {
  type: "gradientLinear" | "gradientRadial" | "gradientAngular";
  handles: [Vector, Vector, Vector];
  stops: ColorStop[];
}

export interface ImagePaint {
  type: "image";
  imageID: string;
  size: "fill" | "contain" | "cover";
}

export type Paint = SolidPaint | GradientPaint | ImagePaint;

export interface DimensionStyleMixin {
  position: "absolute" | "relative";
  display: "flex" | "none";
  x:
    | { left: number }
    | { right: number }
    | { fromCenter: number }
    | { left: number; right: number };
  y:
    | { top: number }
    | { bottom: number }
    | { fromCenter: number }
    | { top: number; bottom: number };
  width: number | "fit-content" | "auto"; // "auto" if stretches
  height: number | "fit-content" | "auto"; // "auto" if stretches
  flexGrow: number;
  alignSelf: "auto" | "stretch";
}

export interface RectangleStyleMixin {
  borderRadius: [number, number, number, number]; // TR, TL, BL, BR
  border: Paint[];
  borderWidth: [number, number, number, number]; // T, R, B, L
  background: Paint[];
}

export interface FrameStyleMixin {
  overflow: "hidden" | "visible"; // TODO: scroll
  flexDirection: "row" | "column";
  gap: number;
  padding: [number, number, number, number]; // T, R, B, L
  alignItems: "center" | "flex-start" | "flex-end" | "baseline";
  justifyContent: "center" | "flex-start" | "flex-end" | "space-between";
}

export interface TextSpanStyleMixin {
  fontFamily: string;
  fontStyle: "normal" | "italic";
  fontWeight: number;
  fontSize: number;
  lineHeight: number | "normal";
  letterSpacing: number; // em;
  color: Paint[];
}

export interface TextStyleMixin {
  textAlign: "left" | "center" | "right" | "justify";
  justifyContent: "center" | "flex-start" | "flex-end"; // assuming a text element becomes a vertical flexbox
}

export interface ImageStyleMixin {
  objectFit: "fill" | "contain" | "cover";
}

export interface FrameStyle
  extends DimensionStyleMixin,
    RectangleStyleMixin,
    FrameStyleMixin {}

export interface TextStyle
  extends DimensionStyleMixin,
    TextSpanStyleMixin,
    TextStyleMixin {}

export interface SVGStyle extends DimensionStyleMixin {}

export interface ImageStyle
  extends DimensionStyleMixin,
    RectangleStyleMixin,
    ImageStyleMixin {}

export type InstanceStyle = Partial<
  DimensionStyleMixin &
    RectangleStyleMixin &
    FrameStyleMixin &
    TextSpanStyleMixin &
    TextStyleMixin &
    ImageStyleMixin
>;
