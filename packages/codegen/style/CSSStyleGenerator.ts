import { Element } from "@uimix/element-ir";
import * as CSS from "csstype";
import { kebabCase } from "lodash-es";
import { ExtendedComponent, GeneratedFile, IStyleGenerator } from "../types";
import { formatCSS } from "../util/format";
import { stringifyStyle } from "./common";
import { elementCSS } from "./InlineStyleGenerator";

export class CSSStyleGenerator implements IStyleGenerator {
  constructor(component: ExtendedComponent) {
    this.component = component;
  }

  component: ExtendedComponent;
  cssContents: string[] = [];

  generate(element: Element, { isRoot }: { isRoot: boolean }): string[] {
    const css = elementCSS(element);

    const className = `${
      this.component.inCodeName ?? "element"
    }-${element.id.replace(":", "-")}`; // TODO: better ID

    this.cssContents.push(`.${className} { ${stringifyStyle(css)} }`);

    if (isRoot) {
      return [
        `className={${JSON.stringify(className + " ")} + props.className}`,
      ];
    } else {
      return [`className="${className}"`];
    }
  }

  additionalImports(): string[] {
    return [`import "./${this.component.inCodeName}.css";`];
  }

  additionalFiles(): GeneratedFile[] {
    return [
      {
        filePath: `${this.component.inCodeName}.css`,
        content: formatCSS(this.cssContents.join("")),
      },
    ];
  }
}
