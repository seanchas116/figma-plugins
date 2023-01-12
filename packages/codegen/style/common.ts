import { Color } from "@uimix/element-ir";
import * as CSS from "csstype";
import { kebabCase } from "lodash-es";

export function colorToCSS(color: Color): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);
  const colors = a === 255 ? [r, g, b] : [r, g, b, a];
  return "#" + colors.map((c) => c.toString(16).padStart(2, "0")).join("");
}

export function stringifyStyle(css: CSS.Properties): string {
  return Object.entries(css)
    .map(([key, value]) => `${kebabCase(key)}: ${value}`)
    .join("; ");
}
