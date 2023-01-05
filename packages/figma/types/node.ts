interface Vector {
  x: number;
  y: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

type BlendMode =
  | "PASS_THROUGH"
  | "NORMAL"
  | "DARKEN"
  | "MULTIPLY"
  | "LINEAR_BURN"
  | "COLOR_BURN"
  | "LIGHTEN"
  | "SCREEN"
  | "LINEAR_DODGE"
  | "COLOR_DODGE"
  | "OVERLAY"
  | "SOFT_LIGHT"
  | "HARD_LIGHT"
  | "DIFFERENCE"
  | "EXCLUSION"
  | "HUE"
  | "SATURATION"
  | "COLOR"
  | "LUMINOSITY";

interface ColorStop {
  position: number;
  color: Color;
}

// TODO: image paint
type Paint =
  | {
      type: "SOLID";
      visible: boolean;
      opacity: number;
      color: Color;
    }
  | {
      type:
        | "GRADIENT_LINEAR"
        | "GRADIENT_RADIAL"
        | "GRADIENT_ANGULAR"
        | "GRADIENT_DIAMOND";
      visible: boolean;
      opacity: number;
      blendMode: BlendMode;
      gradientHandlePositions: Vector[];
      gradientStops: ColorStop[];
    };

interface TypeStyle {
  fontFamily: string;
  fontPostScriptName: string;
  paragraphSpacing: number;
  paragraphIndent: number;
  listSpacing: number;
  italic: boolean;
  fontWeight: number;
  fontSize: number;
  textCase:
    | "ORIGINAL"
    | "UPPER"
    | "LOWER"
    | "TITLE"
    | "SMALL_CAPS"
    | "SMALL_CAPS_FORCED";
  textDecoration: "NONE" | "STRIKETHROUGH" | "UNDERLINE";
  textAutoResize: "NONE" | "HEIGHT" | "WIDTH_AND_HEIGHT" | "TRUNCATE";
  textAlignHorizontal: "LEFT" | "RIGHT" | "CENTER" | "JUSTIFIED";
  textAlignVertical: "TOP" | "CENTER" | "BOTTOM";
  letterSpacing: number;
  fills: Paint[];
  hyperlink: {
    type: "URL" | "NODE";
    url: string;
    nodeID: string;
  };
  opentypeFlags: {
    [flag: string]: number;
  };
  lineHeightPx: number;
  lineHeightPercentFontSize: number;
  lineHeightUnit: "PIXELS" | "FONT_SIZE_%" | "INTRINSIC_%";
}

interface MetadataProps {
  id: string;
  name: string;
  visible?: boolean;
}

interface RectangleProps {
  absoluteBoundingBox: Rectangle;
  constraints: {
    horizontal: "TOP" | "BOTTOM" | "CENTER" | "TOP_BOTTOM" | "SCALE";
    vertical: "LEFT" | "RIGHT" | "CENTER" | "LEFT_RIGHT" | "SCALE";
  };

  opacity: number;
  clipsContent: boolean;

  fills: Paint[];
  strokes: Paint[];
  individualStrokeWeights: {
    top: number;
    right: number;
    left: number;
    bottom: number;
  };
  strokeAlign: "INSIDE" | "OUTSIDE" | "CENTER";

  rectangleCornerRadii: [number, number, number, number];

  layoutAlign: "INHERIT" | "STRETCH" | "MIN" | "CENTER" | "MAX";
  layoutGrow: number;
  layoutPositioning: "AUTO" | "ABSOLUTE";
}

interface FrameProps {
  layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  primaryAxisSizingMode: "FIXED" | "AUTO";
  counterAxisSizingMode: "FIXED" | "AUTO";
  primaryAxisAlignItems: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems: "MIN" | "CENTER" | "MAX" | "BASELINE";
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  itemSpacing: number;
  itemReverseZIndex: boolean;
  strokesIncludedInLayout: boolean;
  overflowDirection:
    | "NONE"
    | "HORIZONTAL_SCROLLING"
    | "VERTICAL_SCROLLING"
    | "HORIZONTAL_AND_VERTICAL_SCROLLING";
}

interface TextProps {
  characters: string;
  style: TypeStyle;
}

interface FrameElement extends MetadataProps, RectangleProps, FrameProps {
  type: "frame";
  children: Element[];
}

interface TextElement extends MetadataProps, RectangleProps, TextProps {
  type: "text";
}

interface SVGElement extends MetadataProps, RectangleProps {
  type: "svg";
  content: string;
}

interface ImageElement extends MetadataProps, RectangleProps {
  type: "image";
  dataURL: string;
}

export type Element = FrameElement | TextElement | SVGElement | ImageElement;
