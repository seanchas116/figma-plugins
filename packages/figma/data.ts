export interface InstanceState {
  path: string;
  name: string;
  props: Record<string, any>;
  autoResize: "none" | "height" | "widthHeight"; // same as Figma text nodes
}
