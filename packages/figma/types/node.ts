interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface SolidPaint {
  type: "solid";
  color: Color;
}

interface Vector {
  x: number;
  y: number;
}

interface ColorStop {
  position: number;
  color: Color;
}

interface GradientPaint {
  type: "gradientLinear" | "gradientRadial" | "gradientAngular";
  handles: [Vector, Vector, Vector];
  stops: ColorStop[];
}

interface ImagePaint {
  type: "image";
  imageID: string;
  size: "fill" | "contain" | "cover";
}

type Paint = SolidPaint | GradientPaint | ImagePaint;

interface RectangleStyleMixin {
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
  width: number | "fit-content";
  height: number | "fit-content";
  flex: 1 | "auto";
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

interface LayoutStyleMixin {
  flexDirection: "row" | "column";
  gap: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  alignItems: "center" | "flex-start" | "flex-end" | "baseline";
  justifyContent: "center" | "flex-start" | "flex-end" | "space-between";
}

interface TextSpanStyleMixin {
  fontFamily: string;
  fontStyle: "normal" | "italic";
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number; // em;
}

interface TextStyleMixin {
  textAlign: "left" | "center" | "right" | "justify";
  justifyContent: "center" | "flex-start" | "flex-end"; // assuming a text element becomes a vertical flexbox
}

interface ImageStyleMixin {
  objectFit: "fill" | "contain" | "cover";
}

interface FrameStyle extends RectangleStyleMixin, LayoutStyleMixin {}

interface TextStyle
  extends RectangleStyleMixin,
    TextSpanStyleMixin,
    TextStyleMixin {}

interface ImageStyle extends RectangleStyleMixin {}
