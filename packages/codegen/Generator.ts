import { Component, Element } from "@uimix/element-ir";
import { camelCase, capitalize } from "lodash-es";
import * as svgParser from "svg-parser";
import { InlineStyleGenerator } from "./style/InlineStyleGenerator";
import { IStyleGenerator } from "./style/IStyleGenerator";

export interface GeneratorOptions {
  jsx?: boolean;
  components?: Record<string, Component>;
  styleGenerator?: IStyleGenerator;
}

export class Generator {
  constructor(options: GeneratorOptions = {}) {
    this.options = {
      jsx: options.jsx ?? false,
      components: new Map(Object.entries(options.components ?? {})),
    };
    this.styleGenerator = options.styleGenerator ?? new InlineStyleGenerator();
  }

  private options: {
    jsx: boolean;
    components: Map<string, Component>;
  };
  readonly styleGenerator: IStyleGenerator;

  private generateTag(
    tagName: string,
    props: Record<string, any>,
    tagExtra: string[],
    children: string[] = []
  ): string[] {
    const propsStr = Object.entries(props).map(([key, value]) =>
      value ? `${key}={${JSON.stringify(value)}}` : key
    );
    return [
      `<${tagName} `,
      ...propsStr,
      ` `,
      ...tagExtra,
      `>`,
      ...children,
      `</${tagName}>`,
    ];
  }

  generateElement(element: Element, depth = 0): string[] {
    const propsSpread = depth === 0 ? "{...props}" : "";

    switch (element.type) {
      case "instance": {
        const component = this.options.components.get(element.componentKey);
        if (component) {
          const props: Record<string, string> = {
            ...this.styleGenerator.instanceCSS(element.style),
          };
          for (const [key, value] of Object.entries(element.properties)) {
            const codeName = camelCase(key.split("#")[0]);
            props[codeName] = value;
          }
          console.log(props);
          // TODO: generate unique name
          const name = capitalize(camelCase(component.element.name));
          return this.generateTag(name, props, []);
        }
        console.error('Component not found: "' + element.componentKey + '"');
        return [];
      }
      case "frame": {
        return this.generateTag(
          "div",
          {
            ...this.styleGenerator.frameCSS(element.style),
          },
          [propsSpread],
          element.children.flatMap((e) => this.generateElement(e, depth + 1))
        );
      }
      case "image": {
        return this.generateTag(
          "img",
          {
            ...this.styleGenerator.imageCSS(element.style),
          },
          []
        );
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

        const properties: Record<string, any> = {
          ...svgElem.properties,
          ...this.styleGenerator.svgCSS(element.style),
        };
        delete properties.xmlns;

        return this.generateTag("svg", properties, [], [svgChildren]);
      }
      case "text": {
        return this.generateTag(
          "div",
          {
            ...this.styleGenerator.textCSS(element.style),
          },
          [],
          [element.content]
        );
      }
    }
  }

  generateComponent(component: Component) {
    // TODO: generate unique name
    const name = capitalize(camelCase(component.element.name));

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
      `export function ${name}(props) { return `,
      ...this.generateElement(element as Element),
      `}`,
    ];
  }
}
