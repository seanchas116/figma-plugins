import {
  CodeInstanceStyle,
  DimensionStyleMixin,
  Element,
  FrameStyle,
  FrameStyleMixin,
  ImageStyle,
  ImageStyleMixin,
  InstanceStyle,
  RectangleStyleMixin,
  SVGStyle,
  TextSpanStyleMixin,
  TextStyle,
  TextStyleMixin,
} from "@uimix/element-ir";
import * as CSS from "csstype";
import { IStyleGenerator } from "../types";
import { colorToCSS } from "./common";

const initialStyles: CSS.Properties = {
  width: "auto",
  height: "auto",
  flexGrow: "0",
  alignSelf: "auto",
  background: "none",
  borderStyle: "none",
  borderWidth: "0px 0px 0px 0px",
  borderRadius: "0px 0px 0px 0px",
  overflow: "visible",
  flexDirection: "row",
  gap: "0px",
  padding: "0px 0px 0px 0px",
  justifyContent: "flex-start",
  fontStyle: "normal",
  lineHeight: "normal",
  letterSpacing: "0em",
};

function dimensionCSSPartial(
  mixin: Partial<DimensionStyleMixin>
): CSS.Properties {
  const props: CSS.Properties = {};

  if (mixin.display !== undefined) {
    props.display = mixin.display;
  }
  if (mixin.position !== undefined) {
    props.position = mixin.position;
  }

  if (mixin.position === "absolute") {
    if (mixin.x !== undefined) {
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
    }

    if (mixin.y !== undefined) {
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
    }

    if (
      mixin.x &&
      mixin.y &&
      "fromCenter" in mixin.x &&
      "fromCenter" in mixin.y
    ) {
      props.transform = `translate(-50%, -50%)`;
    }
  }

  if (mixin.flexGrow !== undefined) {
    props.flexGrow = mixin.flexGrow;
  }
  if (mixin.alignSelf !== undefined) {
    props.alignSelf = mixin.alignSelf;
  }

  if (mixin.width !== undefined) {
    if (typeof mixin.width === "number") {
      props.width = `${mixin.width}px`;
    } else {
      props.width = mixin.width;
    }
  }

  if (mixin.height !== undefined) {
    if (typeof mixin.height === "number") {
      props.height = `${mixin.height}px`;
    } else {
      props.height = mixin.height;
    }
  }

  return props;
}

function rectangleCSSPartial(
  mixin: Partial<RectangleStyleMixin>
): CSS.Properties {
  const props: CSS.Properties = {};

  if (mixin.border !== undefined) {
    props.borderStyle = "none";
    if (mixin.border.length > 0) {
      const border = mixin.border[0];
      if (border.type === "solid") {
        props.borderStyle = "solid";
        props.borderColor = colorToCSS(border.color);
      } else {
        // TODO
      }
    }
  }

  if (mixin.background !== undefined) {
    if (mixin.background.length > 0) {
      props.background = "none";
      const background = mixin.background[0];
      if (background.type === "solid") {
        props.background = colorToCSS(background.color);
      } else {
        // TODO
      }
    }
  }

  if (mixin.borderRadius !== undefined) {
    props.borderRadius = mixin.borderRadius?.map((r) => `${r}px`).join(" ");
  }
  if (mixin.borderWidth !== undefined) {
    props.borderWidth = mixin.borderWidth?.map((r) => `${r}px`).join(" ");
  }

  return props;
}

function frameCSSPartial(mixin: Partial<FrameStyleMixin>): CSS.Properties {
  const props: CSS.Properties = {};

  if (mixin.overflow !== undefined) {
    props.overflow = mixin.overflow;
  }
  if (mixin.flexDirection !== undefined) {
    props.flexDirection = mixin.flexDirection;
  }
  if (mixin.gap !== undefined) {
    props.gap = `${mixin.gap}px`;
  }
  if (mixin.padding !== undefined) {
    // TODO: adjust padding based on border width
    props.padding = mixin.padding.map((r) => `${r}px`).join(" ");
  }
  if (mixin.alignItems !== undefined) {
    props.alignItems = mixin.alignItems;
  }
  if (mixin.justifyContent !== undefined) {
    props.justifyContent = mixin.justifyContent;
  }

  return props;
}

function textSpanCSSPartial(
  mixin: Partial<TextSpanStyleMixin>
): CSS.Properties {
  const props: CSS.Properties = {};
  if (mixin.fontFamily !== undefined) {
    props.fontFamily = mixin.fontFamily + ", sans-serif";
  }
  if (mixin.fontSize !== undefined) {
    props.fontSize = `${mixin.fontSize}px`;
  }
  if (mixin.fontWeight !== undefined) {
    props.fontWeight = mixin.fontWeight;
  }
  if (mixin.fontStyle !== undefined) {
    props.fontStyle = mixin.fontStyle;
  }
  if (mixin.lineHeight !== undefined) {
    props.lineHeight = mixin.lineHeight;
  }
  if (mixin.letterSpacing !== undefined) {
    props.letterSpacing = `${mixin.letterSpacing}em`;
  }

  if (mixin.color !== undefined) {
    props.color = "black";
    if (mixin.color.length > 0) {
      const color = mixin.color[0];
      if (color.type === "solid") {
        props.color = colorToCSS(color.color);
      }
    }
  }

  return props;
}

function textCSSPartial(mixin: Partial<TextStyleMixin>): CSS.Properties {
  const props: CSS.Properties = {};

  if (mixin.textAlign !== undefined) {
    props.textAlign = mixin.textAlign;
  }
  if (mixin.justifyContent !== undefined) {
    props.flexDirection = "column";
    props.justifyContent = mixin.justifyContent;
  }

  return props;
}

function imageCSSPartial(mixin: Partial<ImageStyleMixin>): CSS.Properties {
  const props: CSS.Properties = {};

  if (mixin.objectFit !== undefined) {
    props.objectFit = mixin.objectFit;
  }
  return props;
}

function removeInitialStyles(prop: CSS.Properties): CSS.Properties {
  const ret: CSS.Properties = {};
  for (const _key in prop) {
    const key = _key as keyof CSS.Properties;
    if (prop[key] && String(prop[key]) !== initialStyles[key]) {
      // @ts-ignore
      ret[key] = prop[key];
    }
  }
  return ret;
}

function frameCSS(style: Partial<FrameStyle>): CSS.Properties {
  return removeInitialStyles({
    ...dimensionCSSPartial(style),
    ...rectangleCSSPartial(style),
    ...frameCSSPartial(style),
  });
}

function imageCSS(style: Partial<ImageStyle>): CSS.Properties {
  return removeInitialStyles({
    ...dimensionCSSPartial(style),
    ...rectangleCSSPartial(style),
    ...imageCSSPartial(style),
  });
}

function svgCSS(style: Partial<SVGStyle>): CSS.Properties {
  return removeInitialStyles({
    ...dimensionCSSPartial(style),
  });
}

function textCSS(style: Partial<TextStyle>): CSS.Properties {
  return removeInitialStyles({
    ...dimensionCSSPartial(style),
    ...textSpanCSSPartial(style),
    ...textCSSPartial(style),
  });
}

function instanceCSS(style: Partial<InstanceStyle>): CSS.Properties {
  return {
    ...dimensionCSSPartial(style),
    ...rectangleCSSPartial(style),
    ...frameCSSPartial(style),
  };
}

function codeInstanceCSS(style: Partial<CodeInstanceStyle>): CSS.Properties {
  return {
    ...dimensionCSSPartial(style),
  };
}

export function elementCSS(element: Element): CSS.Properties {
  switch (element.type) {
    case "frame":
      return frameCSS(element.style);
    case "image":
      return imageCSS(element.style);
    case "text":
      return textCSS(element.style);
    case "svg":
      return svgCSS(element.style);
    case "instance":
      return instanceCSS(element.style);
    case "codeInstance":
      return codeInstanceCSS(element.style);
  }
}

export class InlineStyleGenerator implements IStyleGenerator {
  generate(element: Element, { isRoot }: { isRoot: boolean }): string[] {
    const css = elementCSS(element);

    let stringified = JSON.stringify(css);
    if (isRoot) {
      stringified = stringified.slice(0, -1) + ", ...props.style}";
    }

    return ["style={" + stringified + "}"];
  }
}
