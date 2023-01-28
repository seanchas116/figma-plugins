import { PerBreakpointStyle } from "../pluginData";
import { diffObjects } from "../util/common";
import {
  getPerBreakpointStyle,
  setPerBreakpointStyle,
} from "./PerBreakpointStyle";

type PerBreakpointStylesData2 = Record<number, PerBreakpointStyle> & {
  default: PerBreakpointStyle;
};

export class PerBreakpointStyles {
  node: SceneNode;
  breakpoints: { width: number }[];
  styles: Partial<PerBreakpointStyle>[];
  default: PerBreakpointStyle;

  constructor(
    node: SceneNode,
    data: PerBreakpointStylesData2,
    breakpoints: { width: number }[]
  ) {
    this.node = node;
    this.breakpoints = breakpoints;
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
    for (let i = this.breakpoints.length - 1; i > index; --i) {
      Object.assign(base, this.styles[i]);
    }
    return base;
  }

  record(width: number) {
    const bi = this.getBreakpointIndex(width);
    if (bi === this.breakpoints.length) {
      this.default = getPerBreakpointStyle(this.node);
      return;
    }

    const current = getPerBreakpointStyle(this.node);
    const base = this.getStyleForBreakpoint(bi);

    const diff = diffObjects(base, current);
    this.styles[bi] = diff;
  }

  restore(width: number) {
    const bi = this.getBreakpointIndex(width);
    setPerBreakpointStyle(this.node, this.getStyleForBreakpoint(bi));
  }
}
