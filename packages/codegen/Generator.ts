import { Component, Element, PropertyDefinition } from "@uimix/element-ir";
import { camelCase, capitalize } from "lodash-es";
import * as svgParser from "svg-parser";
import { IStyleGenerator } from "./style/IStyleGenerator";
import { TailwindStyleGenerator } from "./style/TailwindStyleGenerator";

interface ExtendedPropertyDefinition extends PropertyDefinition {
  nameForCode: string;
}

interface ExtendedComponent extends Component {
  nameForCode: string;
  propertyMap: Map<string /* name */, ExtendedPropertyDefinition>;
}

export interface GeneratorOptions {
  jsx?: boolean;
  components: Component[];
  styleGenerator?: IStyleGenerator;
}

export class Generator {
  constructor(options: GeneratorOptions) {
    this.components = [];

    for (const component of options.components) {
      const propertyMap = new Map<string, ExtendedPropertyDefinition>();

      // TODO: avoid name conflicts

      for (const prop of component.propertyDefinitions) {
        const nameForCode = camelCase(prop.name.split("#")[0]);
        propertyMap.set(prop.name, {
          ...prop,
          nameForCode,
        });
      }

      this.components.push({
        ...component,
        nameForCode: capitalize(camelCase(component.element.name ?? "")),
        propertyMap,
      });
    }

    for (const component of this.components) {
      if (component.key) {
        this.componentMap.set(component.key, component);
      }
    }

    this.options = {
      jsx: options.jsx ?? false,
    };
    this.styleGenerator =
      options.styleGenerator ?? new TailwindStyleGenerator();
  }

  private options: {
    jsx: boolean;
  };
  readonly components: ExtendedComponent[];
  readonly componentMap = new Map<string, ExtendedComponent>();
  readonly styleGenerator: IStyleGenerator;

  private generateTag(
    isRoot: boolean,
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
      ...(isRoot ? [" {...props}"] : []),
      ...propsStr,
      ` `,
      ...tagExtra,
      `>`,
      ...children,
      `</${tagName}>`,
    ];
  }

  generateElement(element: Element, isRoot = true): string[] {
    switch (element.type) {
      case "instance": {
        const component = this.componentMap.get(element.componentKey);
        if (component) {
          const props: Record<string, string> = {};
          for (const [name, value] of Object.entries(element.properties)) {
            const def = component.propertyMap.get(name);
            if (def) {
              props[def.nameForCode] = value;
            }
          }
          console.log(props);
          return this.generateTag(
            isRoot,
            component.nameForCode,
            props,
            this.styleGenerator.instanceCSS(element.style, isRoot)
          );
        }
        console.error('Component not found: "' + element.componentKey + '"');
        return [];
      }
      case "frame": {
        return this.generateTag(
          isRoot,
          "div",
          {},
          this.styleGenerator.frameCSS(element.style, isRoot),
          element.children.flatMap((e) => this.generateElement(e, false))
        );
      }
      case "image": {
        return this.generateTag(
          isRoot,
          "img",
          {},
          this.styleGenerator.imageCSS(element.style, isRoot)
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
        };
        delete properties.xmlns;

        return this.generateTag(
          isRoot,
          "svg",
          properties,
          this.styleGenerator.svgCSS(element.style, isRoot),
          [svgChildren]
        );
      }
      case "text": {
        return this.generateTag(
          isRoot,
          "div",
          {},
          this.styleGenerator.textCSS(element.style, isRoot),
          [element.content]
        );
      }
    }
  }

  generateComponent(component: ExtendedComponent): string[] {
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
      `export function ${component.nameForCode}(props) { return `,
      ...this.generateElement(element as Element),
      `}`,
    ];
  }

  generateProject(): string[] {
    return this.components.flatMap((c) => this.generateComponent(c));
  }
}
