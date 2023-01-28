import { ResponsiveArtboardInfo } from "../../types/data";
import {
  getResponsiveArtboardData,
  ResponsiveArtboardData,
  setPerBreakpointStylesData,
  setResponsiveArtboardData,
} from "../pluginData";
import { Breakpoint } from "./Breakpoint";
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

    const data: ResponsiveArtboardData = {};
    setResponsiveArtboardData(topLevelNode, data);
    topLevelNode.setRelaunchData({
      open: "",
    });

    const artboard = new ResponsiveArtboard(topLevelNode, data);
    artboard.savePerBreakpointStyles(Infinity);
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
    const styles = new PerBreakpointStyles(node, this.breakpoints);
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
    const styles = new PerBreakpointStyles(node, this.breakpoints);
    styles.restore(this.node.width);

    if ("children" in node) {
      for (const child of node.children) {
        this.restorePerBreakpointStyles(width, child);
      }
    }
  }

  getInfo(): ResponsiveArtboardInfo {
    return {
      width: this.node.width,
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
