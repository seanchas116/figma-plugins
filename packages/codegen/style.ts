import {
  Color,
  DimensionStyleMixin,
  FrameStyleMixin,
  ImageStyleMixin,
  RectangleFillBorderStyleMixin,
  TextSpanStyleMixin,
  TextStyleMixin,
} from "@uimix/element-ir";
import * as CSS from "csstype";
import { kebabCase } from "lodash-es";

export type ParentLayout = "row" | "column";

export function dimensionCSS(mixin: DimensionStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};

  props.display = mixin.display;

  props.position = mixin.position;

  if (mixin.position === "absolute") {
    if ("fromCenter" in mixin.x) {
      props.left = `${mixin.x.fromCenter}px`;
      props.transform = `translateX(-50%)`;
    }
    if ("left" in mixin.x) {
      props.left = `${mixin.x.left}px`;
    }
    if ("right" in mixin.x) {
      props.right = `${mixin.x.right}px`;
    }

    if ("fromCenter" in mixin.y) {
      props.top = `${mixin.y.fromCenter}px`;
      props.transform = `translateY(-50%)`;
    }
    if ("top" in mixin.y) {
      props.top = `${mixin.y.top}px`;
    }
    if ("bottom" in mixin.y) {
      props.bottom = `${mixin.y.bottom}px`;
    }

    if ("fromCenter" in mixin.x && "fromCenter" in mixin.y) {
      props.transform = `translate(-50%, -50%)`;
    }
  }

  props.flexGrow = mixin.flexGrow;
  props.alignSelf = mixin.alignSelf;

  if (typeof mixin.width === "number") {
    props.width = `${mixin.width}px`;
  } else {
    props.width = mixin.width;
  }

  if (typeof mixin.height === "number") {
    props.height = `${mixin.height}px`;
  } else {
    props.height = mixin.height;
  }

  return props;
}

function colorToCSS(color: Color): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function rectangleCSS(
  mixin: RectangleFillBorderStyleMixin
): CSS.Properties {
  const props: CSS.Properties = {};

  if (mixin.border.length > 0) {
    const border = mixin.border[0];
    if (border.type === "solid") {
      props.borderColor = colorToCSS(border.color);
    } else {
      // TODO
    }
  }

  if (mixin.background.length > 0) {
    const background = mixin.background[0];
    if (background.type === "solid") {
      props.backgroundColor = colorToCSS(background.color);
    } else {
      // TODO
    }
  }

  props.borderRadius = mixin.borderRadius.map((r) => `${r}px`).join(" ");
  props.borderWidth = mixin.borderWidth.map((r) => `${r}px`).join(" ");

  return props;
}

export function frameCSS(mixin: FrameStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};

  props.overflow = mixin.overflow;
  props.flexDirection = mixin.flexDirection;
  props.gap = `${mixin.gap}px`;
  // TODO: adjust padding based on border width
  props.padding = mixin.padding.map((r) => `${r}px`).join(" ");
  props.alignItems = mixin.alignItems;
  props.justifyContent = mixin.justifyContent;

  return props;
}

export function textSpanCSS(mixin: TextSpanStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};
  props.fontFamily = mixin.fontFamily;
  props.fontSize = `${mixin.fontSize}px`;
  props.fontWeight = mixin.fontWeight;
  props.fontStyle = mixin.fontStyle;
  props.lineHeight = mixin.lineHeight;
  props.letterSpacing = `${mixin.letterSpacing}em`;

  if (mixin.color.length > 0) {
    const color = mixin.color[0];
    if (color.type === "solid") {
      props.color = colorToCSS(color.color);
    }
  }

  return props;
}

export function textCSS(mixin: TextStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};

  props.flexDirection = "column";
  props.textAlign = mixin.textAlign;
  props.justifyContent = mixin.justifyContent;

  return props;
}

export function imageCSS(mixin: ImageStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};
  props.objectFit = mixin.objectFit;
  return props;
}

export function stringifyStyle(css: CSS.Properties): string {
  return Object.entries(css)
    .map(([key, value]) => `${kebabCase(key)}: ${value}`)
    .join("; ");
}
