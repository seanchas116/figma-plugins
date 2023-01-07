import {
  Color,
  DimensionStyleMixin,
  Element,
  FrameStyleMixin,
  ImageStyleMixin,
  RectangleFillBorderStyleMixin,
  TextSpanStyleMixin,
  TextStyleMixin,
} from "@uimix/element-ir";
import type * as hast from "hast";
import * as svgParser from "svg-parser";
import { h } from "hastscript";
import * as CSS from "csstype";
import { kebabCase } from "lodash-es";

function dimensionCSS(
  mixin: DimensionStyleMixin,
  parentFlexDirection: "row" | "column" | undefined,
  isRoot: boolean
): CSS.Properties {
  const props: CSS.Properties = {};

  props.display = mixin.display;

  if (isRoot) {
    props.position = "relative";
  } else {
    props.position = mixin.position;

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
  }

  // width/height: stretch is experimental in CSS, so we use flex/align-self instead

  if (mixin.width === "stretch") {
    if (parentFlexDirection === "row") {
      props.flex = 1;
    } else if (parentFlexDirection === "column") {
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
    } else if (parentFlexDirection === "row") {
      props.alignSelf = "stretch";
    }
  } else if (mixin.height === "fit-content") {
    props.height = mixin.height;
  } else {
    props.height = `${mixin.height}px`;
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

function rectangleCSS(mixin: RectangleFillBorderStyleMixin): CSS.Properties {
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

  props.borderRadius = `${mixin.borderTopLeftRadius}px ${mixin.borderTopRightRadius}px ${mixin.borderBottomRightRadius}px ${mixin.borderBottomLeftRadius}px`;
  props.borderWidth = `${mixin.borderTopWidth}px ${mixin.borderRightWidth}px ${mixin.borderBottomWidth}px ${mixin.borderLeftWidth}px`;

  return props;
}

function frameCSS(mixin: FrameStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};

  props.overflow = mixin.overflow;
  props.flexDirection = mixin.flexDirection;
  props.gap = `${mixin.gap}px`;
  // TODO: adjust padding based on border width
  props.padding = `${mixin.paddingTop}px ${mixin.paddingRight}px ${mixin.paddingBottom}px ${mixin.paddingLeft}px`;
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
      props.color = colorToCSS(color.color);
    }
  }

  return props;
}

function textCSS(mixin: TextStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};

  props.flexDirection = "column";
  props.textAlign = mixin.textAlign;
  props.justifyContent = mixin.justifyContent;

  return props;
}

function imageCSS(mixin: ImageStyleMixin): CSS.Properties {
  const props: CSS.Properties = {};
  props.objectFit = mixin.objectFit;
  return props;
}

function stringifyStyle(css: CSS.Properties): string {
  return Object.entries(css)
    .map(([key, value]) => `${kebabCase(key)}: ${value}`)
    .join("; ");
}

function generateInternalHTMLWithInlineCSS(
  element: Element,
  parentFlexDirection: "row" | "column" | undefined,
  isRoot: boolean
): hast.Content {
  switch (element.type) {
    case "frame": {
      return h(
        "div",
        {
          style: stringifyStyle({
            ...dimensionCSS(element.style, parentFlexDirection, isRoot),
            ...rectangleCSS(element.style),
            ...frameCSS(element.style),
          }),
        },
        ...element.children.map((e) =>
          generateInternalHTMLWithInlineCSS(
            e,
            element.style.flexDirection,
            false
          )
        )
      );
    }
    case "image": {
      return h("img", {
        style: stringifyStyle({
          ...dimensionCSS(element.style, parentFlexDirection, isRoot),
          ...rectangleCSS(element.style),
          ...imageCSS(element.style),
        }),
      });
    }
    case "svg": {
      const root = svgParser.parse(element.svg) as hast.Root;
      const svgElem = root.children[0];
      if (svgElem.type !== "element") {
        throw new Error("Expected element type");
      }

      const properties: hast.Properties = {
        ...svgElem.properties,
        style: stringifyStyle({
          ...dimensionCSS(element.style, parentFlexDirection, isRoot),
        }),
      };
      delete properties.xmlns;
      return {
        ...svgElem,
        properties,
      };
    }
    case "text": {
      return h(
        "div",
        {
          style: stringifyStyle({
            ...dimensionCSS(element.style, parentFlexDirection, isRoot),
            ...textSpanCSS(element.style),
            ...textCSS(element.style),
          }),
        },
        element.content
      );
    }
  }
}

export function generateHTMLWithInlineCSS(
  element: Element,
  parentFlexDirection?: "row" | "column"
): hast.Content {
  return generateInternalHTMLWithInlineCSS(element, parentFlexDirection, true);
}
