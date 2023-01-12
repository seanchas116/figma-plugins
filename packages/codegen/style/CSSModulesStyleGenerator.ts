import { Element } from "@uimix/element-ir";
import { ExtendedComponent, GeneratedFile, IStyleGenerator } from "../types";
import { formatCSS } from "../util/format";
import { IDGenerator } from "../util/IDGenerator";
import { generateJSIdentifier, getIncrementalUniqueName } from "../util/name";
import { stringifyStyle } from "./common";
import { elementCSS } from "./InlineStyleGenerator";

export class CSSModulesStyleGenerator implements IStyleGenerator {
  constructor(component: ExtendedComponent) {
    this.component = component;
  }

  component: ExtendedComponent;
  cssContents: string[] = [];
  idGenerator = new IDGenerator();

  generate(element: Element, { isRoot }: { isRoot: boolean }): string[] {
    const css = elementCSS(element);

    const className = this.idGenerator.generate(element.name);
    this.cssContents.push(`.${className} { ${stringifyStyle(css)} }`);

    if (isRoot) {
      return [`className={styles.${className} + " " + props.className}`];
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
