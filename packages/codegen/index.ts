import { Component, Element } from "@uimix/element-ir";
import { camelCase } from "lodash-es";
import * as svgParser from "svg-parser";
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
  components?: Record<string, Component>;
}

export class Generator {
  constructor(options: GeneratorOptions = {}) {
    this.options = {
      jsx: options.jsx ?? false,
      components: new Map(Object.entries(options.components ?? {})),
    };
  }

  private options: {
    jsx: boolean;
    components: Map<string, Component>;
  };

  private generateTag(
    tagName: string,
    props: Record<string, string | number | boolean>,
    children: string[] = []
  ): string[] {
    const propsStr = Object.entries(props)
      .map(([key, value]) =>
        value ? `${key}={${JSON.stringify(value)}}` : key
      )
      .join(" ");
    return [`<${tagName} ${propsStr}>`, ...children, `</${tagName}>`];
  }

  generateElement(element: Element, parentLayout?: ParentLayout): string[] {
    switch (element.type) {
      case "instance": {
        const component = this.options.components.get(element.componentKey);
        if (component) {
          const props: Record<string, string> = {};
          for (const [key, value] of Object.entries(element.properties)) {
            const codeName = camelCase(key.split("#")[0]);
            props[codeName] = value;
          }
          console.log(props);
          return this.generateTag(component.element.name, props);
        }
        console.error('Component not found: "' + element.componentKey + '"');
        return [];
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
            this.generateElement(e, element.style.flexDirection)
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
        const root = svgParser.parse(element.svg);
        const svgElem = root.children[0];
        if (svgElem.type !== "element") {
          throw new Error("Expected element type");
        }

        const svgChildren = element.svg
          .trim()
          .replace(/^<svg[^>]*>/, "")
          .replace(/<\/svg>$/, "");

        const properties: Record<string, string> = {
          ...svgElem.properties,
          style: stringifyStyle({
            ...dimensionCSS(element.style, parentLayout),
          }),
        };
        delete properties.xmlns;

        return this.generateTag("svg", properties, [svgChildren]);
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

  generateComponent(component: Component) {
    const name = component.element.name;

    const element = {
      ...component.element,
      style: {
        ...component.element.style,
        position: "relative",
        x: { left: 0 },
        y: { top: 0 },
      },
    };

    return [
      `export function ${name}() { return `,
      ...this.generateElement(element),
      `}`,
    ];
  }
}
