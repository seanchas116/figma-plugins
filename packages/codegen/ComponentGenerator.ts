import { Element } from "@uimix/element-ir";
import * as svgParser from "svg-parser";
import { ExtendedComponent, GeneratedFile } from "./types";
import { formatJS } from "./util/format";
import { CSSModulesStyleGenerator } from "./style/CSSModulesStyleGenerator";
import { CSSStyleGenerator } from "./style/CSSStyleGenerator";
import { InlineStyleGenerator } from "./style/InlineStyleGenerator";
import { IStyleGenerator } from "./types";
import { TailwindStyleGenerator } from "./style/TailwindStyleGenerator";

export interface ComponentGeneratorOptions {
  style: "tailwind" | "inline" | "css" | "cssModules";
  otherComponents: Map<string, ExtendedComponent>;
}

export class ComponentGenerator {
  constructor(
    component: ExtendedComponent,
    options: ComponentGeneratorOptions
  ) {
    this.component = component;
    this.otherComponents = options.otherComponents;
    this.styleGenerator = this.createStyleGenerator(options.style);
  }

  readonly component: ExtendedComponent;
  readonly otherComponents: Map<string, ExtendedComponent>;
  readonly styleGenerator: IStyleGenerator;
  readonly usedComponents = new Set<string>();

  private createStyleGenerator(
    style: ComponentGeneratorOptions["style"]
  ): IStyleGenerator {
    switch (style) {
      case "tailwind":
        return new TailwindStyleGenerator();
      case "inline":
        return new InlineStyleGenerator();
      case "css":
        return new CSSStyleGenerator(this.component);
      case "cssModules":
        return new CSSModulesStyleGenerator(this.component);
      default:
        throw new Error("Unknown style: " + style);
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

        this.usedComponents.add(mainComponent.inCodeName);

        const props: Record<string, string> = {};
        for (const [name, value] of Object.entries(element.properties)) {
          const def = mainComponent.propertyForName.get(name);
          if (def) {
            props[def.inCodeName] = value;
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

    const imports = Array.from(this.usedComponents).map(
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

export function generateElements(
  elements: Element[],
  style: ComponentGeneratorOptions["style"]
): string {
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
    { style, otherComponents: new Map() }
  );
  const text = elements
    .flatMap((elem) => generator.generateElement(elem, { isRoot: false }))
    .join("");
  return formatJS(text);
}
