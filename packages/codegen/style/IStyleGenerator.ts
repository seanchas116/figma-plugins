import { Element } from "@uimix/element-ir";
import { ExtendedComponent } from "../component";

export type Props = Record<string, any>;

export interface IStyleGenerator {
  generate(
    element: Element,
    opts: {
      component?: ExtendedComponent;
      cssContents: string[];
      isRoot: boolean;
    }
  ): string[];
}
