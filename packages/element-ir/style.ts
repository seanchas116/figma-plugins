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

export interface RectangleStyleMixin {
  position: "absolute" | "relative";
  display: "flex" | "none";
  x:
    | { left: number }
    | { right: number }
    | { center: number }
    | { left: number; right: number };
  y:
    | { top: number }
    | { bottom: number }
    | { center: number }
    | { top: number; bottom: number };
  width: number | "fit-content" | "auto"; // auto if stretches
  height: number | "fit-content" | "auto";
  flexGrow: 1 | 0;
  alignSelf: "stretch" | "auto";
  overflow: "hidden" | "visible"; // TODO: scroll

  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;

  border: Paint[];
  borderTopWidth: number;
  borderRightWidth: number;
  borderBottomWidth: number;
  borderLeftWidth: number;

  background: Paint[];
}

export interface LayoutStyleMixin {
  flexDirection: "row" | "column";
  gap: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  alignItems: "center" | "flex-start" | "flex-end" | "baseline";
  justifyContent: "center" | "flex-start" | "flex-end" | "space-between";
}

export interface TextSpanStyleMixin {
  fontFamily: string;
  fontStyle: "normal" | "italic";
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number; // em;
}

export interface TextStyleMixin {
  textAlign: "left" | "center" | "right" | "justify";
  justifyContent: "center" | "flex-start" | "flex-end"; // assuming a text element becomes a vertical flexbox
}

export interface ImageStyleMixin {
  objectFit: "fill" | "contain" | "cover";
}

export interface FrameStyle extends RectangleStyleMixin, LayoutStyleMixin {}

export interface TextStyle
  extends RectangleStyleMixin,
    TextSpanStyleMixin,
    TextStyleMixin {}

export interface ImageStyle extends RectangleStyleMixin {}
