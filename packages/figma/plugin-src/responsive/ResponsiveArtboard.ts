import { ResponsiveArtboardInfo } from "../../types/data";
import {
  getResponsiveArtboardData,
  ResponsiveArtboardData,
  setPerBreakpointStylesData,
  setResponsiveArtboardData,
} from "../pluginData";
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

export class ResponsiveArtboard {
  static get(node: SceneNode): ResponsiveArtboard | undefined {
    const topLevelNode = getTopLevelNode(node);
    if (!topLevelNode) {
      return;
    }
    const data = getResponsiveArtboardData(topLevelNode);
    if (!data) {
      return;
    }

    return new ResponsiveArtboard(topLevelNode, data);
  }

  static attach(topLevelNode: FrameNode | ComponentNode): ResponsiveArtboard {
    const existing = ResponsiveArtboard.get(topLevelNode);
    if (existing) {
      return existing;
    }

    const name = topLevelNode.name;

    const componentNode = figma.createComponent();
    copyProperties(topLevelNode, componentNode);
    componentNode.name = "breakpoint=for editing";

    for (const child of topLevelNode.children) {
      componentNode.appendChild(child);
    }

    const index = figma.currentPage.children.indexOf(topLevelNode);
    if (index !== -1) {
      figma.currentPage.insertChild(index, componentNode);
    } else {
      figma.currentPage.appendChild(componentNode);
    }

    topLevelNode.remove();

    const componentSetNode = figma.combineAsVariants(
      [componentNode],
      figma.currentPage
    );
    componentSetNode.name = name;

    const data: ResponsiveArtboardData = {};
    setResponsiveArtboardData(componentNode, data);
    componentNode.setRelaunchData({
      open: "",
    });

    const artboard = new ResponsiveArtboard(componentNode, data);
    artboard.savePerBreakpointStyles(Infinity);

    for (const breakpiint of artboard.breakpoints) {
      const variant = componentNode.clone();
      variant.name = `breakpoint=< ${breakpiint.width}`;
      variant.locked = true;
      variant.visible = false;
      componentSetNode.insertChild(0, variant);
    }

    const defaultVariant = componentNode.clone();
    defaultVariant.name = "breakpoint=default";
    defaultVariant.locked = true;
    defaultVariant.visible = false;
    componentSetNode.insertChild(0, defaultVariant);

    return artboard;
  }

  private constructor(
    node: FrameNode | ComponentNode,
    data: ResponsiveArtboardData
  ) {
    this.node = node;
    this.data = data;
  }

  readonly node: FrameNode | ComponentNode;
  readonly data: ResponsiveArtboardData;
  readonly breakpoints: Breakpoint[] = [
    { width: 768 },
    { width: 1024 },
    { width: 1280 },
  ];

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

    if ("children" in node) {
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

    if ("children" in node) {
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
    setResponsiveArtboardData(this.node, undefined);
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
