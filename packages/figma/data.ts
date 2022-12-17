import type { ComponentDoc } from "react-docgen-typescript";

export interface ComponentState {
  path: string;
  name: string;
  props: Record<string, any>;
  autoResize: "none" | "height" | "widthHeight"; // same as Figma text nodes
}
