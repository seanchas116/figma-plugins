import { Element } from "@uimix/element-ir";
import * as CSS from "csstype";
import { kebabCase } from "lodash-es";
import { ExtendedComponent } from "../component";
import { elementCSS } from "./InlineStyleGenerator";
import { IStyleGenerator } from "./IStyleGenerator";

export function stringifyStyle(css: CSS.Properties): string {
  return Object.entries(css)
    .map(([key, value]) => `${kebabCase(key)}: ${value}`)
    .join("; ");
}

export class CSSModulesStyleGenerator implements IStyleGenerator {
  generate(
    element: Element,
    {
      isRoot,
      cssContents,
      component,
    }: {
      isRoot: boolean;
      cssContents?: string[];
      component?: ExtendedComponent;
    }
  ): string[] {
    const css = elementCSS(element);

    const className = `${
      component?.inCodeName ?? "element"
    }-${element.id.replace(":", "-")}`; // TODO: better ID

    cssContents?.push(`.${className} { ${stringifyStyle(css)} }`);

    if (isRoot) {
      return [`className={styles["${className}"] + props.className}`];
    } else {
      return [`className={styles["${className}"]}`];
    }
  }

  additionalImports?(component: ExtendedComponent): string[] {
    return [`import styles from "./${component.inCodeName}.module.css";`];
  }

  get styleSuffix(): string {
    return ".module.css";
  }
}