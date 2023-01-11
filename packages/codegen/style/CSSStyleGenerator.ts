import { Element } from "@uimix/element-ir";
import { ExtendedComponent } from "../component";
import {
  frameCSS,
  imageCSS,
  instanceCSS,
  stringifyStyle,
  svgCSS,
  textCSS,
} from "./InlineStyleGenerator";
import { IStyleGenerator } from "./IStyleGenerator";

export class CSSStyleGenerator implements IStyleGenerator {
  generate(
    element: Element,
    {
      isRoot,
      cssContents,
      component,
    }: {
      isRoot: boolean;
      cssContents?: string[];
      component?: ExtendedComponent;
    }
  ): string[] {
    const css = (() => {
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
      }
    })();

    const className = `${
      component?.inCodeName ?? "element"
    }-${element.id.replace(":", "-")}`; // TODO: better ID

    cssContents?.push(`.${className} { ${stringifyStyle(css)} }`);

    if (isRoot) {
      return [
        `className={${JSON.stringify(className + " ")} + props.className}`,
      ];
    } else {
      return [`className="${className}"`];
    }
  }
}
