import {
  DimensionStyleMixin,
  FrameStyle,
  FrameStyleMixin,
  ImageStyle,
  ImageStyleMixin,
  RectangleStyleMixin,
  SVGStyle,
  TextSpanStyleMixin,
  TextStyle,
  TextStyleMixin,
} from "@uimix/element-ir";
import * as CSS from "csstype";
import resolveConfig from "tailwindcss/resolveConfig";
import defaultConfig from "tailwindcss/defaultConfig";
import { colorToCSS } from "./common";
const defaultTheme = resolveConfig(defaultConfig).theme!;

function dimensionClassNamesPartial(
  mixin: Partial<DimensionStyleMixin>
): string[] {
  const classNames: string[] = [];

  if (mixin.display !== undefined) {
    classNames.push(mixin.display);
  }
  if (mixin.position !== undefined) {
    classNames.push(mixin.position);
  }

  if (mixin.position === "absolute") {
    if (mixin.x !== undefined) {
      if ("fromCenter" in mixin.x) {
        classNames.push(`left-[${mixin.x.fromCenter}px]`);
        classNames.push(`translate-x-1/2`);
      }
      if ("left" in mixin.x) {
        classNames.push(`left-[${mixin.x.left}px]`);
      }
      if ("right" in mixin.x) {
        classNames.push(`right-[${mixin.x.right}px]`);
      }
    }

    if (mixin.y !== undefined) {
      if ("fromCenter" in mixin.y) {
        classNames.push(`top-[${mixin.y.fromCenter}px]`);
        classNames.push(`translate-y-1/2`);
      }
      if ("top" in mixin.y) {
        classNames.push(`top-[${mixin.y.top}px]`);
      }
      if ("bottom" in mixin.y) {
        classNames.push(`bottom-[${mixin.y.bottom}px]`);
      }
    }
  }

  if (mixin.flexGrow !== undefined) {
    classNames.push(mixin.flexGrow === 1 ? "flex-1" : "flex-none");
  }
  if (mixin.alignSelf !== undefined) {
    classNames.push(`self-${mixin.alignSelf}`);
  }

  if (mixin.width !== undefined) {
    if (typeof mixin.width === "number") {
      classNames.push(`w-[${mixin.width}px]`);
    } else if (mixin.width === "fit-content") {
      classNames.push("w-fit");
    } else {
      classNames.push("w-auto");
    }
  }

  if (mixin.height !== undefined) {
    if (typeof mixin.height === "number") {
      classNames.push(`h-[${mixin.height}px]`);
    } else if (mixin.height === "fit-content") {
      classNames.push("h-fit");
    } else {
      classNames.push("h-auto");
    }
  }

  return classNames;
}

function rectangleClassNamesPartial(
  mixin: Partial<RectangleStyleMixin>
): string[] {
  const classNames: string[] = [];

  if (mixin.border !== undefined) {
    let borderClass = "border-transparent";
    if (mixin.border.length > 0) {
      const border = mixin.border[0];
      if (border.type === "solid") {
        let borderClass = `border-[${colorToCSS(border.color)}]`;
      } else {
        // TODO
      }
    }
    classNames.push(borderClass);
  }

  if (mixin.background !== undefined) {
    let bgClass = "bg-transparent";
    if (mixin.background.length > 0) {
      const background = mixin.background[0];
      if (background.type === "solid") {
        bgClass = colorToCSS(background.color);
        bgClass = `bg-[${bgClass}]`;
      } else {
        // TODO
      }
    }
    classNames.push(bgClass);
  }

  if (mixin.borderRadius !== undefined) {
    classNames.push(
      `rounded-tl-[${mixin.borderRadius[0]}px]`,
      `rounded-tr-[${mixin.borderRadius[1]}px]`,
      `rounded-br-[${mixin.borderRadius[2]}px]`,
      `rounded-bl-[${mixin.borderRadius[3]}px]`
    );
  }
  if (mixin.borderWidth !== undefined) {
    classNames.push(
      `border-t-[${mixin.borderWidth[0]}px]`,
      `border-r-[${mixin.borderWidth[1]}px]`,
      `border-b-[${mixin.borderWidth[2]}px]`,
      `border-l-[${mixin.borderWidth[3]}px]`
    );
  }

  return classNames;
}

function frameClassNamesPartial(mixin: Partial<FrameStyleMixin>): string[] {
  const classNames: string[] = [];

  if (mixin.overflow !== undefined) {
    classNames.push(`overflow-${mixin.overflow}`);
  }
  if (mixin.flexDirection !== undefined) {
    classNames.push(`flex-${mixin.flexDirection}`);
  }
  if (mixin.gap !== undefined) {
    classNames.push(`gap-[${mixin.gap}px]`);
  }
  if (mixin.padding !== undefined) {
    // TODO: adjust padding based on border width
    classNames.push(
      `pt-[${mixin.padding[0]}px]`,
      `pr-[${mixin.padding[1]}px]`,
      `pb-[${mixin.padding[2]}px]`,
      `pl-[${mixin.padding[3]}px]`
    );
  }
  if (mixin.alignItems !== undefined) {
    switch (mixin.alignItems) {
      case "flex-start":
        classNames.push("items-start");
        break;
      case "flex-end":
        classNames.push("items-end");
        break;
      case "center":
        classNames.push("items-center");
        break;
      case "baseline":
        classNames.push("items-baseline");
        break;
    }
  }
  if (mixin.justifyContent !== undefined) {
    switch (mixin.justifyContent) {
      case "flex-start":
        classNames.push("justify-start");
        break;
      case "flex-end":
        classNames.push("justify-end");
        break;
      case "center":
        classNames.push("justify-center");
        break;
      case "space-between":
        classNames.push("justify-between");
        break;
    }
  }

  return classNames;
}

function textSpanClassNamesPartial(
  mixin: Partial<TextSpanStyleMixin>
): string[] {
  const classNames: string[] = [];

  if (mixin.fontFamily !== undefined) {
    classNames.push(`font-['${mixin.fontFamily.replace(/\s+/g, "_")}']`);
  }
  if (mixin.fontSize !== undefined) {
    classNames.push(`text-[${mixin.fontSize}px]`);
  }
  if (mixin.fontWeight !== undefined) {
    classNames.push(`font-${mixin.fontWeight}`);
  }
  if (mixin.fontStyle !== undefined) {
    classNames.push(mixin.fontStyle === "italic" ? "italic" : "not-italic");
  }
  if (mixin.lineHeight !== undefined) {
    classNames.push(`leading-[${mixin.lineHeight}]`);
  }
  if (mixin.letterSpacing !== undefined) {
    classNames.push(`tracking-[${mixin.letterSpacing}em]`);
  }

  if (mixin.color !== undefined) {
    let colorClass = "text-transparent";
    if (mixin.color.length > 0) {
      const color = mixin.color[0];
      if (color.type === "solid") {
        colorClass = `text-[${colorToCSS(color.color)}]`;
      }
    }
    classNames.push(colorClass);
  }

  return classNames;
}

function textClassNamesPartial(mixin: Partial<TextStyleMixin>): string[] {
  const classNames: string[] = [];

  if (mixin.textAlign !== undefined) {
    classNames.push(`text-${mixin.textAlign}`);
  }
  if (mixin.justifyContent !== undefined) {
    classNames.push(`flex-col`);
    switch (mixin.justifyContent) {
      case "flex-start":
        classNames.push("justify-start");
        break;
      case "flex-end":
        classNames.push("justify-end");
        break;
      case "center":
        classNames.push("justify-center");
        break;
    }
  }

  return classNames;
}

function imageClassNamesPartial(mixin: Partial<ImageStyleMixin>): string[] {
  const classNames: string[] = [];

  if (mixin.objectFit !== undefined) {
    classNames.push(`object-${mixin.objectFit}`);
  }

  return classNames;
}

export function frameClassNames(style: Partial<FrameStyle>): string[] {
  return [
    ...dimensionClassNamesPartial(style),
    ...rectangleClassNamesPartial(style),
    ...frameClassNamesPartial(style),
  ];
}

export function imageClassNames(style: Partial<ImageStyle>): string[] {
  return [
    ...dimensionClassNamesPartial(style),
    ...rectangleClassNamesPartial(style),
    ...imageClassNamesPartial(style),
  ];
}

export function svgClassNames(style: Partial<SVGStyle>): string[] {
  return [...dimensionClassNamesPartial(style)];
}

export function textClassNames(style: Partial<TextStyle>): string[] {
  return [
    ...dimensionClassNamesPartial(style),
    ...textSpanClassNamesPartial(style),
    ...textClassNamesPartial(style),
  ];
}
