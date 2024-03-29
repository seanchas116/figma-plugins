import { Element } from "@uimix/element-ir";
import * as svgParser from "svg-parser";
import { ExtendedComponent, GeneratedFile } from "./types";
import { formatJS } from "./util/format";
import { CSSModulesStyleGenerator } from "./style/CSSModulesStyleGenerator";
import { CSSStyleGenerator } from "./style/CSSStyleGenerator";
import { InlineStyleGenerator } from "./style/InlineStyleGenerator";
import { IStyleGenerator } from "./types";
import { TailwindStyleGenerator } from "./style/TailwindStyleGenerator";
import { Config } from "./Config";

export interface ComponentGeneratorOptions {
  config: Config;
  otherComponents: Map<string, ExtendedComponent>;
}

export class ComponentGenerator {
  constructor(
    component: ExtendedComponent,
    options: ComponentGeneratorOptions
  ) {
    this.config = options.config;
    this.component = component;
    this.otherComponents = options.otherComponents;
    this.styleGenerator = this.createStyleGenerator(options.config.style);
  }

  readonly config: Config;
  readonly component: ExtendedComponent;
  readonly otherComponents: Map<string, ExtendedComponent>;
  readonly styleGenerator: IStyleGenerator;
  readonly importedComponents = new Set<string>();

  private createStyleGenerator(style: Config["style"]): IStyleGenerator {
    switch (style) {
      case "tailwind":
        return new TailwindStyleGenerator(this.config);
      case "inline":
        return new InlineStyleGenerator();
      case "css":
        return new CSSStyleGenerator(this.component);
      case "cssModules":
        return new CSSModulesStyleGenerator(this.component);
      default:
        throw new Error(`Unknown style: ${style as string}`);
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

    const openTag = [
      tagName,
      isRoot ? "{...props} " : "",
      ...propsStr,
      ...tagExtra,
    ].join(" ");

    if (children.length) {
      return [`<${openTag}>`, ...children, `</${tagName}>`];
    } else {
      return [`<${openTag} />`];
    }
  }

  generateElement(
    element: Element,
    { isRoot = true }: { isRoot?: boolean } = {}
  ): string[] {
    let result: string[];

    const tagExtra = this.styleGenerator.generate(element, {
      isRoot,
    });

    switch (element.type) {
      case "instance": {
        const mainComponent = this.otherComponents.get(element.componentKey);
        if (!mainComponent) {
          console.error('Component not found: "' + element.componentKey + '"');
          return [];
        }

        this.importedComponents.add(mainComponent.inCodeName);

        const props: Record<string, string> = {};
        for (const [name, value] of Object.entries(element.properties)) {
          const def = mainComponent.propertyForName.get(name);
          if (def) {
            props[def.inCodeName] = value as string;
          }
        }
        result = this.generateTag(mainComponent.inCodeName, {
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
              isRoot: false,
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

        if (element.propertyRef.children) {
          const prop = this.component.propertyForName.get(
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
      case "codeInstance": {
        // TODO: add imports
        result = this.generateTag(element.component.name, {
          isRoot,
          props: element.properties,
          tagExtra,
        });
        break;
      }
    }

    if (element.propertyRef.visible) {
      const prop = this.component.propertyForName.get(
        element.propertyRef.visible
      );
      if (prop) {
        result = [`{props.${prop.inCodeName} && `, ...result, `}`];
      }
    }

    return result;
  }

  generate(): GeneratedFile[] {
    const element = {
      ...this.component.element,
      style: {
        ...this.component.element.style,
        position: "relative",
        x: { left: 0 },
        y: { top: 0 },
      },
    };

    const body = [
      `export function ${this.component.inCodeName}(props) { return `,
      ...this.generateElement(element as Element, {}),
      `}`,
    ];

    const imports = Array.from(this.importedComponents).map(
      (c) => `import { ${c} } from "./${c}.js";`
    );

    const additionalImports = this.styleGenerator.additionalImports?.();
    if (additionalImports) {
      imports.push(...additionalImports);
    }

    const source = [...imports, "\n\n", ...body];

    const jsFile: GeneratedFile = {
      filePath: `${this.component.inCodeName}.js`, // TODO: typescript
      content: formatJS(source.join("")),
    };

    return [...(this.styleGenerator.additionalFiles?.() ?? []), jsFile];
  }
}

export function generateElements(elements: Element[], config: Config): string {
  if (elements.length === 0) {
    return "";
  }

  const generator = new ComponentGenerator(
    {
      element: elements[0],
      propertyDefinitions: [],
      propertyForName: new Map(),
      inCodeName: "Component",
    },
    { config, otherComponents: new Map() }
  );
  return elements
    .map((elem) => {
      const code = generator.generateElement(elem, { isRoot: false }).join("");
      return formatJS(code).replace(/;\s*$/, "");
    })
    .join("\n");
}
