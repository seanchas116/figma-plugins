import { Element } from "@uimix/element-ir";

export type Props = Record<string, any>;

export interface IStyleGenerator {
  generate(
    element: Element,
    opts: {
      cssContents: string[];
      isRoot: boolean;
    }
  ): string[];
}
