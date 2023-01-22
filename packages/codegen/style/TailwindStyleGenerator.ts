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
import { Config } from "../Config";
import { IStyleGenerator } from "../types";
import { TailwindKeywordResolver } from "./TailwindKeywordResolver";

const initialClassNames = new Set([
  "w-auto",
  "h-auto",
  "h-fit",
  "flex-none",
  "self-auto",
  "bg-none",
  "bg-transparent",
  "border-transparent",
  "rounded-tr-none",
  "rounded-br-none",
  "rounded-bl-none",
  "rounded-tl-none",
  "border-t-0",
  "border-r-0",
  "border-b-0",
  "border-l-0",
  "overflow-visible",
  "flex-row",
  "gap-0",
  "pt-0",
  "pr-0",
  "pb-0",
  "pl-0",
  "justify-start",
  "font-normal",
  "text-left", // TODO: this will be text-center if the element is a button
  "not-italic",
  "leading-normal",
  "tracking-normal",
]);

class TailwindClassNameGenerator {
  constructor(config: Config) {
    this.config = config;
  }

  readonly config: Config;
  readonly kw = new TailwindKeywordResolver();

  dimensionClassNamesPartial(mixin: Partial<DimensionStyleMixin>): string[] {
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
          classNames.push(`left${this.kw.spacing(mixin.x.fromCenter)}`);
          classNames.push(`translate-x-1/2`);
        }
        if ("left" in mixin.x) {
          classNames.push(`left${this.kw.spacing(mixin.x.left)}`);
        }
        if ("right" in mixin.x) {
          classNames.push(`right${this.kw.spacing(mixin.x.right)}`);
        }
      }

      if (mixin.y !== undefined) {
        if ("fromCenter" in mixin.y) {
          classNames.push(`top${this.kw.spacing(mixin.y.fromCenter)}`);
          classNames.push(`translate-y-1/2`);
        }
        if ("top" in mixin.y) {
          classNames.push(`top${this.kw.spacing(mixin.y.top)}`);
        }
        if ("bottom" in mixin.y) {
          classNames.push(`bottom${this.kw.spacing(mixin.y.bottom)}`);
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
        classNames.push(`w${this.kw.spacing(mixin.width)}`);
      } else if (mixin.width === "fit-content") {
        classNames.push("w-fit");
      } else {
        classNames.push("w-auto");
      }
    }

    if (mixin.height !== undefined) {
      if (typeof mixin.height === "number") {
        classNames.push(`h${this.kw.spacing(mixin.height)}`);
      } else if (mixin.height === "fit-content") {
        classNames.push("h-fit");
      } else {
        classNames.push("h-auto");
      }
    }

    return classNames;
  }

  rectangleClassNamesPartial(mixin: Partial<RectangleStyleMixin>): string[] {
    const classNames: string[] = [];

    if (mixin.border !== undefined) {
      let borderClass = "border-transparent";
      if (mixin.border.length > 0) {
        const border = mixin.border[0];
        if (border.type === "solid") {
          borderClass = `border${this.kw.color(border.color)}`;
        }
      }
      classNames.push(borderClass);
    }

    if (mixin.background !== undefined) {
      let bgClass = "bg-transparent";
      if (mixin.background.length > 0) {
        const background = mixin.background[0];
        if (background.type === "solid") {
          bgClass = `bg${this.kw.color(background.color)}`;
        } else {
          // TODO
        }
      }
      classNames.push(bgClass);
    }

    if (mixin.borderRadius !== undefined) {
      classNames.push(
        `rounded-tl${this.kw.borderRadius(mixin.borderRadius[0])}`,
        `rounded-tr${this.kw.borderRadius(mixin.borderRadius[1])}`,
        `rounded-br${this.kw.borderRadius(mixin.borderRadius[2])}`,
        `rounded-bl${this.kw.borderRadius(mixin.borderRadius[3])}`
      );
    }
    if (mixin.borderWidth !== undefined) {
      classNames.push(
        `border-t${this.kw.borderWidth(mixin.borderWidth[0])}`,
        `border-r${this.kw.borderWidth(mixin.borderWidth[1])}`,
        `border-b${this.kw.borderWidth(mixin.borderWidth[2])}`,
        `border-l${this.kw.borderWidth(mixin.borderWidth[3])}`
      );
    }

    return classNames;
  }

  frameClassNamesPartial(mixin: Partial<FrameStyleMixin>): string[] {
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
      classNames.push(`gap${this.kw.spacing(mixin.gap)}`);
    }
    if (mixin.padding !== undefined) {
      // TODO: adjust padding based on border width
      classNames.push(
        `pt${this.kw.spacing(mixin.padding[0])}`,
        `pr${this.kw.spacing(mixin.padding[1])}`,
        `pb${this.kw.spacing(mixin.padding[2])}`,
        `pl${this.kw.spacing(mixin.padding[3])}`
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

  textSpanClassNamesPartial(mixin: Partial<TextSpanStyleMixin>): string[] {
    const classNames: string[] = [];

    if (mixin.fontFamily !== undefined && this.config.includesFontFamily) {
      classNames.push(
        `font-['${mixin.fontFamily.replace(/\s+/g, "_")}',sans-serif]`
      );
    }
    if (mixin.fontWeight !== undefined) {
      classNames.push(`font${this.kw.fontWeight(mixin.fontWeight)}`);
    }
    if (mixin.fontStyle !== undefined) {
      classNames.push(mixin.fontStyle === "italic" ? "italic" : "not-italic");
    }
    if (mixin.fontSize !== undefined) {
      classNames.push(`text${this.kw.fontSize(mixin.fontSize)}`);
    }
    if (mixin.lineHeight !== undefined) {
      if (mixin.lineHeight === "normal") {
        classNames.push(`leading-normal`);
      } else {
        classNames.push(`leading${this.kw.lineHeight(mixin.lineHeight)}`);
      }
    }
    if (mixin.letterSpacing !== undefined) {
      classNames.push(`tracking${this.kw.letterSpacing(mixin.letterSpacing)}`);
    }

    if (mixin.color !== undefined) {
      let colorClass = "text-transparent";
      if (mixin.color.length > 0) {
        const color = mixin.color[0];
        if (color.type === "solid") {
          colorClass = `text${this.kw.color(color.color)}`;
        }
      }
      classNames.push(colorClass);
    }

    return classNames;
  }

  textClassNamesPartial(mixin: Partial<TextStyleMixin>): string[] {
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

  imageClassNamesPartial(mixin: Partial<ImageStyleMixin>): string[] {
    const classNames: string[] = [];

    if (mixin.objectFit !== undefined) {
      classNames.push(`object-${mixin.objectFit}`);
    }

    return classNames;
  }

  removeInitialClassNames(classNames: string[]): string[] {
    return classNames.filter((className) => !initialClassNames.has(className));
  }

  frameClassNames(style: Partial<FrameStyle>): string[] {
    return this.removeInitialClassNames([
      ...this.dimensionClassNamesPartial(style),
      ...this.rectangleClassNamesPartial(style),
      ...this.frameClassNamesPartial(style),
    ]);
  }

  imageClassNames(style: Partial<ImageStyle>): string[] {
    const classNames = new Set(
      this.removeInitialClassNames([
        ...this.dimensionClassNamesPartial(style),
        ...this.rectangleClassNamesPartial(style),
        ...this.imageClassNamesPartial(style),
      ])
    );
    classNames.delete("flex");
    classNames.delete("relative");
    return [...classNames];
  }

  svgClassNames(style: Partial<SVGStyle>): string[] {
    const classNames = new Set(
      this.removeInitialClassNames([...this.dimensionClassNamesPartial(style)])
    );

    classNames.delete("flex");
    classNames.delete("relative");
    return [...classNames];
  }

  textClassNames(style: Partial<TextStyle>): string[] {
    const classNames = new Set(
      this.removeInitialClassNames([
        ...this.dimensionClassNamesPartial(style),
        ...this.textSpanClassNamesPartial(style),
        ...this.textClassNamesPartial(style),
      ])
    );

    // optimize classnames
    classNames.delete("relative");
    if (style.justifyContent === "flex-start") {
      classNames.delete("flex");
      classNames.delete("flex-col");
      classNames.delete("flex-start");
    }
    return [...classNames];
  }

  instanceClassNames(style: Partial<InstanceStyle>): string[] {
    return [
      ...this.dimensionClassNamesPartial(style),
      ...this.rectangleClassNamesPartial(style),
      ...this.frameClassNamesPartial(style),
    ];
  }

  codeInstanceClassNames(style: Partial<CodeInstanceStyle>): string[] {
    return [...this.dimensionClassNamesPartial(style)];
  }

  elementClassNames(element: Element): string[] {
    switch (element.type) {
      case "frame":
        return this.frameClassNames(element.style);
      case "image":
        return this.imageClassNames(element.style);
      case "svg":
        return this.svgClassNames(element.style);
      case "text":
        return this.textClassNames(element.style);
      case "instance":
        return this.instanceClassNames(element.style);
      case "codeInstance":
        return this.codeInstanceClassNames(element.style);
    }
  }
}

export class TailwindStyleGenerator implements IStyleGenerator {
  constructor(config: Config) {
    this.config = config;
    this.classNameGenerator = new TailwindClassNameGenerator(config);
  }

  readonly config: Config;
  readonly classNameGenerator: TailwindClassNameGenerator;

  generate(element: Element, { isRoot }: { isRoot: boolean }): string[] {
    const classNames = this.classNameGenerator.elementClassNames(element);

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
