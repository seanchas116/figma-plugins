import { Element } from "@uimix/element-ir";
import * as CSS from "csstype";
import { kebabCase } from "lodash-es";
import { ExtendedComponent } from "../component";
import { formatCSS } from "../util/format";
import { GeneratedFile } from "../Generator";
import { generateJSIdentifier, getIncrementalUniqueName } from "../util/name";
import { elementCSS } from "./InlineStyleGenerator";
import { IStyleGenerator } from "./IStyleGenerator";

export function stringifyStyle(css: CSS.Properties): string {
  return Object.entries(css)
    .map(([key, value]) => `${kebabCase(key)}: ${value}`)
    .join("; ");
}

export class CSSModulesStyleGenerator implements IStyleGenerator {
  constructor(component: ExtendedComponent) {
    this.component = component;
  }

  component: ExtendedComponent;
  cssContents: string[] = [];
  classNames = new Set<string>();

  generate(
    element: Element,
    {
      isRoot,
    }: {
      isRoot: boolean;
    }
  ): string[] {
    const css = elementCSS(element);

    const className = getIncrementalUniqueName(
      this.classNames,
      generateJSIdentifier(element.name || "element")
    );
    this.classNames.add(className);

    this.cssContents.push(`.${className} { ${stringifyStyle(css)} }`);

    if (isRoot) {
      return [`className={styles.${className} + props.className}`];
    } else {
      return [`className={styles.${className}}`];
    }
  }

  additionalImports?(): string[] {
    return [`import styles from "./${this.component.inCodeName}.module.css";`];
  }

  additionalFiles(): GeneratedFile[] {
    return [
      {
        filePath: `${this.component.inCodeName}.module.css`,
        content: formatCSS(this.cssContents.join("")),
      },
    ];
  }
}
