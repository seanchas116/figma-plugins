import {
  getPerBreakpointStylesData,
  PerBreakpointStyle,
  PerBreakpointStylesData,
  setPerBreakpointStylesData,
} from "../pluginData";
import { diffObjects } from "../util/common";
import { Breakpoint } from "./Breakpoint";
import {
  getPerBreakpointStyle,
  setPerBreakpointStyle,
} from "./PerBreakpointStyle";

export class PerBreakpointStyles {
  node: SceneNode;
  isRoot: boolean;
  breakpoints: Breakpoint[];
  currentStyle: PerBreakpointStyle;
  styles: Partial<PerBreakpointStyle>[];
  default: PerBreakpointStyle;

  constructor(breakpoints: Breakpoint[], node: SceneNode, isRoot: boolean) {
    this.node = node;
    this.isRoot = isRoot;
    this.breakpoints = breakpoints;
    this.currentStyle = getPerBreakpointStyle(node, isRoot);
    const data = getPerBreakpointStylesData(node) ?? {
      default: this.currentStyle,
    };

    this.default = data.default;
    this.styles = breakpoints.map((breakpoint) => data[breakpoint.width] ?? {});
  }

  getStyleForBreakpoint(index: number) {
    const base = { ...this.default };
    for (let i = this.breakpoints.length - 1; i >= index; --i) {
      Object.assign(base, this.styles[i]);
    }
    return base;
  }

  save(breakpointIndex: number) {
    if (breakpointIndex === this.breakpoints.length) {
      this.default = { ...this.currentStyle };
    } else {
      const current = this.currentStyle;
      const base = this.getStyleForBreakpoint(breakpointIndex + 1);

      const diff = diffObjects(base, current);
      this.styles[breakpointIndex] = diff;
    }

    this.saveToNode();
  }

  restore(breakpointIndex: number) {
    const style = this.getStyleForBreakpoint(breakpointIndex);
    setPerBreakpointStyle(this.node, style);
  }

  private saveToNode() {
    const data: PerBreakpointStylesData = {
      default: this.default,
    };
    for (let i = 0; i < this.breakpoints.length; ++i) {
      data[this.breakpoints[i].width] = this.styles[i];
    }
    setPerBreakpointStylesData(this.node, data);
    this.node.setRelaunchData({
      open: "",
    });
  }

  getOverriddenBreakpoints(): number[] {
    const overriddenBreakpoints = [];
    for (let i = 0; i < this.breakpoints.length; ++i) {
      const style = this.styles[i];
      if (Object.keys(style).length > 0) {
        overriddenBreakpoints.push(i);
      }
    }
    return overriddenBreakpoints;
  }
}
