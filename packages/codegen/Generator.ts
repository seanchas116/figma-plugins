import { Component, Element, PropertyDefinition } from "@uimix/element-ir";
import { camelCase, capitalize } from "lodash-es";
import * as svgParser from "svg-parser";
import { ExtendedComponent, ExtendedPropertyDefinition } from "./component";
import { formatCSS, formatJS } from "./format";
import { CSSStyleGenerator } from "./style/CSSStyleGenerator";
import { InlineStyleGenerator } from "./style/InlineStyleGenerator";
import { IStyleGenerator } from "./style/IStyleGenerator";
import { TailwindStyleGenerator } from "./style/TailwindStyleGenerator";

export interface GeneratorOptions {
  style: "tailwind" | "inline" | "css";
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

    this.styleGenerator = (() => {
      switch (options.style) {
        case "tailwind":
          return new TailwindStyleGenerator();
        case "inline":
          return new InlineStyleGenerator();
        case "css":
          return new CSSStyleGenerator();
        default:
          throw new Error("Unknown style: " + options.style);
      }
    })();
  }

  readonly components: ExtendedComponent[] = [];
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
      usedComponents,
      cssContents,
      isRoot = true,
    }: {
      component?: ExtendedComponent;
      usedComponents?: Set<string>;
      cssContents?: string[];
      isRoot?: boolean;
    } = {}
  ): string[] {
    let result: string[];

    const tagExtra = this.styleGenerator.generate(element, {
      cssContents: cssContents ?? [],
      component,
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
              cssContents,
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
    const usedComponents = new Set<string>();

    const cssContents: string[] = [];

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
        cssContents,
      }),
      `}`,
    ];

    const imports = Array.from(usedComponents).map(
      (c) => `import { ${c} } from "./${c}.js";`
    );

    const source = [...imports, "\n\n", ...body];

    return [
      ...(cssContents.length > 0
        ? [
            {
              filePath: `${component.inCodeName}.css`,
              content: formatCSS(cssContents.join("")),
            },
          ]
        : []),
      {
        filePath: `${component.inCodeName}.js`, // TODO: typescript
        content: formatJS(source.join("")),
      },
    ];
  }

  generateProject(): GeneratedFile[] {
    return this.components.flatMap((c) => this.generateComponent(c));
  }
}

export interface GeneratedFile {
  filePath: string;
  content: string;
}
