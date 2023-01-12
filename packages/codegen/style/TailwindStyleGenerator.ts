import {
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
import { IStyleGenerator } from "../types";
import { TailwindKeywordResolver } from "./TailwindKeywordResolver";

const kw = new TailwindKeywordResolver();

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
        classNames.push(`left${kw.spacing(mixin.x.fromCenter)}`);
        classNames.push(`translate-x-1/2`);
      }
      if ("left" in mixin.x) {
        classNames.push(`left${kw.spacing(mixin.x.left)}`);
      }
      if ("right" in mixin.x) {
        classNames.push(`right${kw.spacing(mixin.x.right)}`);
      }
    }

    if (mixin.y !== undefined) {
      if ("fromCenter" in mixin.y) {
        classNames.push(`top${kw.spacing(mixin.y.fromCenter)}`);
        classNames.push(`translate-y-1/2`);
      }
      if ("top" in mixin.y) {
        classNames.push(`top${kw.spacing(mixin.y.top)}`);
      }
      if ("bottom" in mixin.y) {
        classNames.push(`bottom${kw.spacing(mixin.y.bottom)}`);
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
      classNames.push(`w${kw.spacing(mixin.width)}`);
    } else if (mixin.width === "fit-content") {
      classNames.push("w-fit");
    } else {
      classNames.push("w-auto");
    }
  }

  if (mixin.height !== undefined) {
    if (typeof mixin.height === "number") {
      classNames.push(`h${kw.spacing(mixin.height)}`);
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
        borderClass = `border${kw.color(border.color)}`;
      }
    }
    classNames.push(borderClass);
  }

  if (mixin.background !== undefined) {
    let bgClass = "bg-transparent";
    if (mixin.background.length > 0) {
      const background = mixin.background[0];
      if (background.type === "solid") {
        bgClass = `bg${kw.color(background.color)}`;
      } else {
        // TODO
      }
    }
    classNames.push(bgClass);
  }

  if (mixin.borderRadius !== undefined) {
    classNames.push(
      `rounded-tl${kw.borderRadius(mixin.borderRadius[0])}`,
      `rounded-tr${kw.borderRadius(mixin.borderRadius[1])}`,
      `rounded-br${kw.borderRadius(mixin.borderRadius[2])}`,
      `rounded-bl${kw.borderRadius(mixin.borderRadius[3])}`
    );
  }
  if (mixin.borderWidth !== undefined) {
    classNames.push(
      `border-t${kw.borderWidth(mixin.borderWidth[0])}`,
      `border-r${kw.borderWidth(mixin.borderWidth[1])}`,
      `border-b${kw.borderWidth(mixin.borderWidth[2])}`,
      `border-l${kw.borderWidth(mixin.borderWidth[3])}`
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
    if (mixin.flexDirection === "row") {
      classNames.push("flex-row");
    } else {
      classNames.push("flex-col");
    }
  }
  if (mixin.gap !== undefined) {
    classNames.push(`gap${kw.spacing(mixin.gap)}`);
  }
  if (mixin.padding !== undefined) {
    // TODO: adjust padding based on border width
    classNames.push(
      `pt${kw.spacing(mixin.padding[0])}`,
      `pr${kw.spacing(mixin.padding[1])}`,
      `pb${kw.spacing(mixin.padding[2])}`,
      `pl${kw.spacing(mixin.padding[3])}`
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
    classNames.push(
      `font-['${mixin.fontFamily.replace(/\s+/g, "_")}',sans-serif]`
    );
  }
  if (mixin.fontSize !== undefined) {
    classNames.push(`text${kw.fontSize(mixin.fontSize)}`);
  }
  if (mixin.fontWeight !== undefined) {
    classNames.push(`font${kw.fontWeight(mixin.fontWeight)}`);
  }
  if (mixin.fontStyle !== undefined) {
    classNames.push(mixin.fontStyle === "italic" ? "italic" : "not-italic");
  }
  if (mixin.lineHeight !== undefined) {
    if (mixin.lineHeight === "normal") {
      classNames.push(`leading-normal`);
    } else {
      classNames.push(`leading${kw.lineHeight(mixin.lineHeight)}`);
    }
  }
  if (mixin.letterSpacing !== undefined) {
    classNames.push(`tracking${kw.letterSpacing(mixin.letterSpacing)}`);
  }

  if (mixin.color !== undefined) {
    let colorClass = "text-transparent";
    if (mixin.color.length > 0) {
      const color = mixin.color[0];
      if (color.type === "solid") {
        colorClass = `text${kw.color(color.color)}`;
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

export function instanceClassNames(style: Partial<InstanceStyle>): string[] {
  return [
    ...dimensionClassNamesPartial(style),
    ...rectangleClassNamesPartial(style),
    ...frameClassNamesPartial(style),
  ];
}

function elementClassNames(element: Element): string[] {
  switch (element.type) {
    case "frame":
      return frameClassNames(element.style);
    case "image":
      return imageClassNames(element.style);
    case "svg":
      return svgClassNames(element.style);
    case "text":
      return textClassNames(element.style);
    case "instance":
      return instanceClassNames(element.style);
  }
}

export class TailwindStyleGenerator implements IStyleGenerator {
  generate(element: Element, { isRoot }: { isRoot: boolean }): string[] {
    const classNames = elementClassNames(element);

    let stringified = JSON.stringify(classNames.join(" "));

    if (isRoot) {
      return ["className={twMerge(", stringified, ", props.className)}"];
    } else {
      return ["className=", stringified];
    }
  }

  additionalImports?(): string[] {
    return [`import {twMerge} from "tailwind-merge";`];
  }
}
