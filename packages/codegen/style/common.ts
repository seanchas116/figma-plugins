import { Color } from "@uimix/element-ir";

export function colorToCSS(color: Color): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
