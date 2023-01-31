import { ResponsiveArtboardInfo } from "../../types/data";
import { setPerBreakpointStylesData } from "../pluginData";
import { copyProperties } from "../util/copyProperties";
import { Breakpoint, getBreakpointIndex } from "./Breakpoint";
import { PerBreakpointStyles } from "./PerBreakpointStyles";

export function getTopLevelNode(
  node: SceneNode
): FrameNode | ComponentNode | undefined {
  const parent = node.parent;
  if (!parent || parent.type === "DOCUMENT") {
    return;
  }

  if (parent.type === "PAGE" || parent.type === "COMPONENT_SET") {
    if (node.type === "FRAME" || node.type === "COMPONENT") {
      return node;
    }
    return;
  }

  return getTopLevelNode(parent);
}

export function getContainingComponentSet(
  node: SceneNode
): ComponentSetNode | undefined {
  if (node.type === "COMPONENT_SET") {
    return node;
  }

  if (
    !node.parent ||
    node.parent.type === "PAGE" ||
    node.parent.type === "DOCUMENT"
  ) {
    return;
  }

  return getContainingComponentSet(node.parent);
}

export class ResponsiveArtboard {
  static get(node: SceneNode): ResponsiveArtboard | undefined {
    const componentSet = getContainingComponentSet(node);
    if (!componentSet) {
      return;
    }
    return this.from(componentSet);
  }

  static from(componentSet: ComponentSetNode): ResponsiveArtboard | undefined {
    let forEditingVariant: ComponentNode | undefined;
    const breakpoints: Breakpoint[] = [];

    for (const variant of componentSet.children) {
      if (variant.name.startsWith("breakpoint=for editing")) {
        forEditingVariant = variant as ComponentNode;
      }
      if (variant.name.startsWith("breakpoint=<")) {
        const width = parseInt(variant.name.split("=<")[1]);
        if (!isNaN(width)) {
          breakpoints.push({ width, variant: variant as ComponentNode });
        }
      }
    }
    breakpoints.sort((a, b) => a.width - b.width);

    if (!forEditingVariant || breakpoints.length === 0) {
      return;
    }

    return new ResponsiveArtboard(componentSet, forEditingVariant, breakpoints);
  }

  static attach(originalNode: FrameNode): ResponsiveArtboard {
    const existing = ResponsiveArtboard.get(originalNode);
    if (existing) {
      return existing;
    }

    const name = originalNode.name;

    const componentNode = figma.createComponent();
    copyProperties(originalNode, componentNode);
    componentNode.name = "breakpoint=for editing";

    for (const child of originalNode.children) {
      componentNode.appendChild(child);
    }

    const index = figma.currentPage.children.indexOf(originalNode);
    if (index !== -1) {
      figma.currentPage.insertChild(index, componentNode);
    } else {
      figma.currentPage.appendChild(componentNode);
    }

    originalNode.remove();

    const componentSetNode = figma.combineAsVariants(
      [componentNode],
      figma.currentPage
    );
    componentSetNode.name = name;

    componentSetNode.strokes = [
      {
        type: "SOLID",
        color: { r: 0x97 / 0xff, g: 0x47 / 0xff, b: 0xff / 0xff },
      },
    ];
    componentSetNode.layoutMode = "HORIZONTAL";
    componentSetNode.counterAxisSizingMode = "AUTO";
    componentSetNode.itemSpacing = 16;
    componentSetNode.paddingTop =
      componentSetNode.paddingRight =
      componentSetNode.paddingBottom =
      componentSetNode.paddingLeft =
        16;

    for (const width of [768, 1024, 1280]) {
      const variant = componentNode.clone();
      variant.name = `breakpoint=< ${width}`;
      variant.locked = true;
      variant.visible = false;
      componentSetNode.insertChild(0, variant);
    }

    const defaultVariant = componentNode.clone();
    defaultVariant.name = "breakpoint=default";
    defaultVariant.locked = true;
    defaultVariant.visible = false;
    componentSetNode.insertChild(0, defaultVariant);

    const artboard = this.from(componentSetNode);
    if (!artboard) {
      throw new Error("Failed to create ResponsiveArtboard");
    }
    return artboard;
  }

  private constructor(
    componentSet: ComponentSetNode,
    node: FrameNode | ComponentNode,
    breakpoints: Breakpoint[]
  ) {
    this.componentSet = componentSet;
    this.node = node;
    this.breakpoints = breakpoints;
  }

  readonly componentSet: ComponentSetNode;
  readonly node: FrameNode | ComponentNode;
  readonly breakpoints: Breakpoint[];

  resize(width: number) {
    this.node.resize(width, this.node.height);
  }

  savePerBreakpointStyles(
    width: number = this.node.width,
    node: SceneNode = this.node
  ) {
    const styles = new PerBreakpointStyles(
      this.breakpoints,
      node,
      node === this.node
    );
    styles.save(this.node.width);

    if ("children" in node && node.type !== "INSTANCE") {
      for (const child of node.children) {
        this.savePerBreakpointStyles(width, child);
      }
    }
  }

  restorePerBreakpointStyles(
    width: number = this.node.width,
    node: SceneNode = this.node
  ): void {
    const styles = new PerBreakpointStyles(
      this.breakpoints,
      node,
      node === this.node
    );
    styles.restore(this.node.width);

    if ("children" in node && node.type !== "INSTANCE") {
      for (const child of node.children) {
        this.restorePerBreakpointStyles(width, child);
      }
    }
  }

  getInfo(node: SceneNode): ResponsiveArtboardInfo {
    const perBreakpointStyles = new PerBreakpointStyles(
      this.breakpoints,
      node,
      node === this.node
    );

    return {
      width: this.node.width,
      breakpoints: this.breakpoints,
      breakpointIndex: getBreakpointIndex(this.breakpoints, this.node.width),
      overriddenIndexes: perBreakpointStyles.getOverriddenBreakpoints(),
    };
  }

  clear() {
    this.node.setRelaunchData({});
    this.clearPerBreakpointStyles(this.node);
  }

  private clearPerBreakpointStyles(node: SceneNode) {
    setPerBreakpointStylesData(node, undefined);
    node.setRelaunchData({});
    if ("children" in node) {
      for (const child of node.children) {
        this.clearPerBreakpointStyles(child);
      }
    }
  }
}
