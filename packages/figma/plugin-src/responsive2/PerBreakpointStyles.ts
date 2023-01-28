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
  breakpoints: Breakpoint[];
  currentStyle: PerBreakpointStyle;
  styles: Partial<PerBreakpointStyle>[];
  default: PerBreakpointStyle;

  constructor(node: SceneNode, breakpoints: Breakpoint[]) {
    this.node = node;
    this.breakpoints = breakpoints;
    this.currentStyle = getPerBreakpointStyle(node);
    const data = getPerBreakpointStylesData(node) ?? {
      default: this.currentStyle,
    };

    this.default = data.default;
    this.styles = breakpoints.map((breakpoint) => data[breakpoint.width] ?? {});
  }

  /// Breakpoints: [768, 1024, 1280]
  /// Index:       767|768  1023|1024 1279|1280
  ///              0  |    1    |    2    |    3
  getBreakpointIndex(width: number) {
    for (let i = 0; i < this.breakpoints.length; ++i) {
      if (width < this.breakpoints[i].width) {
        return i;
      }
    }
    return this.breakpoints.length;
  }

  getStyleForBreakpoint(index: number) {
    const base = { ...this.default };
    for (let i = this.breakpoints.length - 1; i >= index; --i) {
      Object.assign(base, this.styles[i]);
    }
    return base;
  }

  save(width: number) {
    const bi = this.getBreakpointIndex(width);
    if (bi === this.breakpoints.length) {
      this.default = { ...this.currentStyle };
    } else {
      const current = this.currentStyle;
      const base = this.getStyleForBreakpoint(bi);

      const diff = diffObjects(base, current);
      this.styles[bi] = diff;
    }

    this.saveToNode();
  }

  restore(width: number) {
    const bi = this.getBreakpointIndex(width);
    const style = this.getStyleForBreakpoint(bi);
    console.log("restore", style);
    setPerBreakpointStyle(this.node, style);
  }

  private saveToNode() {
    const data: PerBreakpointStylesData = {
      default: this.default,
    };
    for (let i = 0; i < this.breakpoints.length; ++i) {
      data[this.breakpoints[i].width] = this.styles[i];
    }
    console.log("save", data);
    setPerBreakpointStylesData(this.node, data);
    this.node.setRelaunchData({
      open: "",
    });
  }
}
