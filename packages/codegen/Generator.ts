import { Component, Element } from "@uimix/element-ir";
import { camelCase, capitalize } from "lodash-es";
import * as svgParser from "svg-parser";
import {
  ExtendedComponent,
  ExtendedPropertyDefinition,
  GeneratedFile,
} from "./types";
import { formatJS } from "./util/format";
import { CSSModulesStyleGenerator } from "./style/CSSModulesStyleGenerator";
import { CSSStyleGenerator } from "./style/CSSStyleGenerator";
import { InlineStyleGenerator } from "./style/InlineStyleGenerator";
import { IStyleGenerator } from "./types";
import { TailwindStyleGenerator } from "./style/TailwindStyleGenerator";

export interface GeneratorOptions {
  style: "tailwind" | "inline" | "css" | "cssModules";
  components: Component[];
}

export class Generator {
  constructor(options: GeneratorOptions) {
    for (const component of options.components) {
      const propertyForName = new Map<string, ExtendedPropertyDefinition>();

      // TODO: avoid name conflicts

      for (const prop of component.propertyDefinitions) {
        const inCodeName = camelCase(prop.name.split("#")[0]);
        propertyForName.set(prop.name, {
          ...prop,
          inCodeName,
        });
      }

      this.components.push({
        ...component,
        inCodeName: capitalize(camelCase(component.element.name ?? "")),
        propertyForName,
      });
    }

    for (const component of this.components) {
      if (component.key) {
        this.componentMap.set(component.key, component);
      }
    }

    this.style = options.style;
  }

  readonly components: ExtendedComponent[] = [];
  readonly componentMap = new Map<string, ExtendedComponent>();
  readonly style: GeneratorOptions["style"];

  private createStyleGenerator(component: ExtendedComponent): IStyleGenerator {
    switch (this.style) {
      case "tailwind":
        return new TailwindStyleGenerator();
      case "inline":
        return new InlineStyleGenerator();
      case "css":
        return new CSSStyleGenerator(component);
      case "cssModules":
        return new CSSModulesStyleGenerator(component);
      default:
        throw new Error("Unknown style: " + this.style);
    }
  }

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
      styleGenerator = new InlineStyleGenerator(),
      component,
      usedComponents,
      isRoot = true,
    }: {
      styleGenerator?: IStyleGenerator;
      component?: ExtendedComponent;
      usedComponents?: Set<string>;
      isRoot?: boolean;
    } = {}
  ): string[] {
    let result: string[];

    const tagExtra = styleGenerator.generate(element, {
      isRoot,
    });

    switch (element.type) {
      case "instance": {
        const component = this.componentMap.get(element.componentKey);
        if (!component) {
          console.error('Component not found: "' + element.componentKey + '"');
          return [];
        }

        usedComponents?.add(component.inCodeName);

        const props: Record<string, string> = {};
        for (const [name, value] of Object.entries(element.properties)) {
          const def = component.propertyForName.get(name);
          if (def) {
            props[def.inCodeName] = value;
          }
        }
        result = this.generateTag(component.inCodeName, {
          isRoot,
          props,
          tagExtra,
        });
        break;
      }
      case "frame": {
        result = this.generateTag("div", {
          isRoot,
          tagExtra,
          children: element.children.flatMap((e) =>
            this.generateElement(e, {
              component,
              isRoot: false,
              usedComponents,
              styleGenerator,
            })
          ),
        });
        break;
      }
      case "image": {
        result = this.generateTag("img", {
          isRoot,
          tagExtra,
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
          tagExtra,
          children: [svgChildren],
        });
        break;
      }
      case "text": {
        let children = [element.children];

        if (component && element.propertyRef.children) {
          const prop = component.propertyForName.get(
            element.propertyRef.children
          );
          if (prop) {
            children = [`{props.${prop.inCodeName}}`];
          }
        }

        result = this.generateTag("div", {
          isRoot,
          tagExtra,
          children,
        });
        break;
      }
    }

    if (element.propertyRef.visible) {
      const prop = component?.propertyForName.get(element.propertyRef.visible);
      if (prop) {
        result = [`{props.${prop.inCodeName} && `, ...result, `}`];
      }
    }

    return result;
  }

  generateComponent(component: ExtendedComponent): GeneratedFile[] {
    const styleGenerator = this.createStyleGenerator(component);
    const usedComponents = new Set<string>();

    const element = {
      ...component.element,
      style: {
        ...component.element.style,
        position: "relative",
        x: { left: 0 },
        y: { top: 0 },
      },
    };

    const body = [
      `export function ${component.inCodeName}(props) { return `,
      ...this.generateElement(element as Element, {
        component,
        usedComponents,
        styleGenerator,
      }),
      `}`,
    ];

    const imports = Array.from(usedComponents).map(
      (c) => `import { ${c} } from "./${c}.js";`
    );

    const additionalImports = styleGenerator.additionalImports?.();
    if (additionalImports) {
      imports.push(...additionalImports);
    }

    const source = [...imports, "\n\n", ...body];

    const jsFile: GeneratedFile = {
      filePath: `${component.inCodeName}.js`, // TODO: typescript
      content: formatJS(source.join("")),
    };

    return [...(styleGenerator.additionalFiles?.() ?? []), jsFile];
  }

  generateProject(): GeneratedFile[] {
    return this.components.flatMap((c) => this.generateComponent(c));
  }
}
