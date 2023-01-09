import { Element } from "@uimix/element-ir";
import type * as hast from "hast";
import * as svgParser from "svg-parser";
import { toHtml } from "hast-util-to-html";
import {
  ParentLayout,
  stringifyStyle,
  dimensionCSS,
  rectangleCSS,
  frameCSS,
  imageCSS,
  textSpanCSS,
  textCSS,
} from "./style";

interface GeneratorOptions {
  jsx?: boolean;
}

export class Generator {
  constructor(options: GeneratorOptions = {}) {
    this.options = {
      jsx: options.jsx ?? false,
    };
  }

  private options: {
    jsx: boolean;
  };

  private generateTag(
    tagName: string,
    props: Record<string, string>,
    children: string[] = []
  ): string[] {
    const propsStr = Object.entries(props)
      .map(([key, value]) => (value ? `${key}=${JSON.stringify(value)}` : key))
      .join(" ");
    return [`<${tagName} ${propsStr}>`, ...children, `</${tagName}>`];
  }

  generate(element: Element, parentLayout?: ParentLayout): string[] {
    switch (element.type) {
      case "instance": {
        // TODO
        return this.generateTag("div", {
          "component-key": element.componentKey,
        });
      }
      case "frame": {
        return this.generateTag(
          "div",
          {
            style: stringifyStyle({
              ...dimensionCSS(element.style, parentLayout),
              ...rectangleCSS(element.style),
              ...frameCSS(element.style),
            }),
          },
          element.children.flatMap((e) =>
            this.generate(e, element.style.flexDirection)
          )
        );
      }
      case "image": {
        return this.generateTag("img", {
          style: stringifyStyle({
            ...dimensionCSS(element.style, parentLayout),
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

        const children = toHtml(svgElem.children);

        const properties: Record<string, string> = {
          ...svgElem.properties,
          style: stringifyStyle({
            ...dimensionCSS(element.style, parentLayout),
          }),
          children,
        };
        delete properties.xmlns;

        return this.generateTag(svgElem.tagName, properties);
      }
      case "text": {
        return this.generateTag("div", {
          style: stringifyStyle({
            ...dimensionCSS(element.style, parentLayout),
            ...textSpanCSS(element.style),
            ...textCSS(element.style),
          }),
        });
      }
    }
  }
}
