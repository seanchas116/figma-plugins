export interface InstanceInfo {
  props: Record<string, any>;
  autoResize: "none" | "height" | "widthHeight"; // same as Figma text nodes
}

export interface ComponentInfo {
  path: string;
  name: string;
}

export interface TargetInfo {
  component: ComponentInfo;
  instance: InstanceInfo;
}
