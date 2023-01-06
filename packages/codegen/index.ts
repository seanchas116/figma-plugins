import {
  DimensionStyleMixin,
  Element,
  FrameStyleMixin,
  ImageStyleMixin,
  RectangleFillBorderStyleMixin,
  TextSpanStyleMixin,
  TextStyleMixin,
} from "@uimix/element-ir";
import type * as hast from "hast";
import { h } from "hastscript";
import * as CSS from "csstype";

function dimensionCSS(
  mixin: DimensionStyleMixin,
  parentFlexDirection?: "row" | "column"
): CSS.Properties {
  const props: CSS.Properties = {};

  props.position = mixin.position;
  props.display = mixin.display;

  if ("centerRatio" in mixin.x) {
    props.left = `${mixin.x.centerRatio * 100}%`;
    props.transform = `translateX(-50%)`;
  }
  if ("left" in mixin.x) {
    props.left = `${mixin.x.left}px`;
  }
  if ("right" in mixin.x) {
    props.right = `${mixin.x.right}px`;
  }

  if ("centerRatio" in mixin.y) {
    props.top = `${mixin.y.centerRatio * 100}%`;
    props.transform = `translateY(-50%)`;
  }
  if ("top" in mixin.y) {
    props.top = `${mixin.y.top}px`;
  }
  if ("bottom" in mixin.y) {
    props.bottom = `${mixin.y.bottom}px`;
  }

  // width/height: stretch is experimental in CSS, so we use flex/align-self instead

  if (mixin.width === "stretch") {
    if (parentFlexDirection === "row") {
      props.flex = 1;
    } else {
      props.alignSelf = "stretch";
    }
  } else if (mixin.width === "fit-content") {
    props.width = mixin.width;
  } else {
    props.width = `${mixin.width}px`;
  }

  if (mixin.height === "stretch") {
    if (parentFlexDirection === "column") {
      props.flex = 1;
    } else {
      props.alignSelf = "stretch";
    }
  } else if (mixin.height === "fit-content") {
    props.height = mixin.height;
  } else {
    props.height = `${mixin.height}px`;
  }

  return props;
}

function rectangleCSS(mixin: RectangleFillBorderStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};

  if (mixin.border.length > 0) {
    const border = mixin.border[0];
    if (border.type === "solid") {
      props.borderColor = `rgba(${border.color.r}, ${border.color.g}, ${border.color.b}, ${border.color.a})`;
    } else {
      // TODO
    }
  }

  if (mixin.background.length > 0) {
    const background = mixin.background[0];
    if (background.type === "solid") {
      props.backgroundColor = `rgba(${background.color.r}, ${background.color.g}, ${background.color.b}, ${background.color.a})`;
    } else {
      // TODO
    }
  }

  props.borderTopLeftRadius = `${mixin.borderTopLeftRadius}px`;
  props.borderTopRightRadius = `${mixin.borderTopRightRadius}px`;
  props.borderBottomLeftRadius = `${mixin.borderBottomLeftRadius}px`;
  props.borderBottomRightRadius = `${mixin.borderBottomRightRadius}px`;

  props.borderTopWidth = `${mixin.borderTopWidth}px`;
  props.borderRightWidth = `${mixin.borderRightWidth}px`;
  props.borderBottomWidth = `${mixin.borderBottomWidth}px`;
  props.borderLeftWidth = `${mixin.borderLeftWidth}px`;

  return props;
}

function frameCSS(mixin: FrameStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};

  props.overflow = mixin.overflow;
  props.flexDirection = mixin.flexDirection;
  props.gap = `${mixin.gap}px`;
  // TODO: adjust padding based on border width
  props.paddingTop = `${mixin.paddingTop}px`;
  props.paddingRight = `${mixin.paddingRight}px`;
  props.paddingBottom = `${mixin.paddingBottom}px`;
  props.paddingLeft = `${mixin.paddingLeft}px`;
  props.alignItems = mixin.alignItems;
  props.justifyContent = mixin.justifyContent;

  return props;
}

function textSpanCSS(mixin: TextSpanStyleMixin): CSS.Properties {
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
      props.color = `rgba(${color.color.r}, ${color.color.g}, ${color.color.b}, ${color.color.a})`;
    }
  }

  return props;
}

function textCSS(mixin: TextStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};

  props.textAlign = mixin.textAlign;
  props.justifyContent = mixin.justifyContent;

  return props;
}

function imageCSS(mixin: ImageStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};
  props.objectFit = mixin.objectFit;
  return props;
}

export function inlineCSS(element: Element): hast.Content {
  switch (element.type) {
    case "frame": {
      return h(
        "div",
        {
          style: {
            ...dimensionCSS(element.style),
            ...rectangleCSS(element.style),
            ...frameCSS(element.style),
          },
        },
        ...element.children.map(inlineCSS)
      );
    }
    case "image": {
      return h("img", {
        style: {
          ...dimensionCSS(element.style),
          ...rectangleCSS(element.style),
          ...imageCSS(element.style),
        },
      });
    }
    case "svg": {
      return h("svg", {
        style: {
          ...dimensionCSS(element.style),
          ...rectangleCSS(element.style),
        },
      });
    }
    case "text": {
      return h(
        "div",
        {
          style: {
            ...dimensionCSS(element.style),
            ...textSpanCSS(element.style),
            ...textCSS(element.style),
          },
        },
        element.content
      );
    }
  }
}
