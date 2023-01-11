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
    tagName: string,
    {
      isRoot,
      props = {},
      tagExtra = [],
      children = [],
    }: {
      isRoot: boolean;
      props?: Record<string, any>;
      tagExtra?: string[];
      children?: string[];
    }
  ): string[] {
    const propsStr = Object.entries(props).map(
      ([key, value]) => `${key}={${JSON.stringify(value)}}`
    );

    const openTag =
      `<${tagName} ` +
      (isRoot ? "{...props} " : "") +
      propsStr.join("") +
      tagExtra.join("") +
      `>`;
    const closeTag = `</${tagName}>`;

    return [openTag, ...children, closeTag];
  }

  generateElement(
    element: Element,
    {
      component,
      isRoot = true,
    }: {
      component?: ExtendedComponent;
      isRoot?: boolean;
    } = {}
  ): string[] {
    let result: string[];

    switch (element.type) {
      case "instance": {
        const component = this.componentMap.get(element.componentKey);
        if (!component) {
          console.error('Component not found: "' + element.componentKey + '"');
          return [];
        }

        const props: Record<string, string> = {};
        for (const [name, value] of Object.entries(element.properties)) {
          const def = component.propertyMap.get(name);
          if (def) {
            props[def.nameForCode] = value;
          }
        }
        console.log(props);
        result = this.generateTag(component.nameForCode, {
          isRoot,
          props,
          tagExtra: this.styleGenerator.instanceCSS(element.style, isRoot),
        });
        break;
      }
      case "frame": {
        result = this.generateTag("div", {
          isRoot,
          tagExtra: this.styleGenerator.frameCSS(element.style, isRoot),
          children: element.children.flatMap((e) =>
            this.generateElement(e, { component, isRoot: false })
          ),
        });
        break;
      }
      case "image": {
        result = this.generateTag("img", {
          isRoot,
          tagExtra: this.styleGenerator.imageCSS(element.style, isRoot),
        });
        break;
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

        const props: Record<string, any> = {
          ...svgElem.properties,
        };
        delete props.xmlns;

        result = this.generateTag("svg", {
          isRoot,
          props,
          tagExtra: this.styleGenerator.svgCSS(element.style, isRoot),
          children: [svgChildren],
        });
        break;
      }
      case "text": {
        let children = [element.children];

        if (component && element.propertyRef.children) {
          const prop = component.propertyMap.get(element.propertyRef.children);
          if (prop) {
            children = [`{props.${prop.nameForCode}}`];
          }
        }

        result = this.generateTag("div", {
          isRoot,
          tagExtra: this.styleGenerator.textCSS(element.style, isRoot),
          children,
        });
        break;
      }
    }

    if (element.propertyRef.visible) {
      const prop = component?.propertyMap.get(element.propertyRef.visible);
      if (prop) {
        result = [`{props.${prop.nameForCode} && `, ...result, `}`];
      }
    }

    return result;
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
      ...this.generateElement(element as Element, { component }),
      `}`,
    ];
  }

  generateProject(): string[] {
    return this.components.flatMap((c) => this.generateComponent(c));
  }
}
