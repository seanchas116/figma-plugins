import { Element } from "@uimix/element-ir";
import { ExtendedComponent, GeneratedFile, IStyleGenerator } from "../types";
import { formatCSS } from "../util/format";
import { generateJSIdentifier, getIncrementalUniqueName } from "../util/name";
import { stringifyStyle } from "./common";
import { elementCSS } from "./InlineStyleGenerator";

export class CSSModulesStyleGenerator implements IStyleGenerator {
  constructor(component: ExtendedComponent) {
    this.component = component;
  }

  component: ExtendedComponent;
  cssContents: string[] = [];
  classNames = new Set<string>();

  generate(element: Element, { isRoot }: { isRoot: boolean }): string[] {
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
