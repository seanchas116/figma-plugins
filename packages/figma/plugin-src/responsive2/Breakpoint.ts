export interface Breakpoint {
  width: number;
}

/// Breakpoints: [768, 1024, 1280]
/// Index:       767|768  1023|1024 1279|1280
///              0  |    1    |    2    |    3
export function getBreakpointIndex(breakpoints: Breakpoint[], width: number) {
  for (let i = 0; i < breakpoints.length; ++i) {
    if (width < breakpoints[i].width) {
      return i;
    }
  }
  return breakpoints.length;
}
