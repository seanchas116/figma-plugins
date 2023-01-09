import {
  FrameStyle,
  ImageStyle,
  InstanceStyle,
  SVGStyle,
  TextStyle,
} from "@uimix/element-ir";

export type Props = Record<string, any>;

export interface IStyleGenerator {
  frameCSS(style: Partial<FrameStyle>, isRoot: boolean): string[];
  imageCSS(style: Partial<ImageStyle>, isRoot: boolean): string[];
  svgCSS(style: Partial<SVGStyle>, isRoot: boolean): string[];
  textCSS(style: Partial<TextStyle>, isRoot: boolean): string[];
  instanceCSS(style: Partial<InstanceStyle>, isRoot: boolean): string[];
}
