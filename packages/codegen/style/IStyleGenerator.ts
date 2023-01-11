import { Element } from "@uimix/element-ir";

export type Props = Record<string, any>;

export interface IStyleGenerator {
  generate(element: Element, isRoot: boolean): string[];
}
