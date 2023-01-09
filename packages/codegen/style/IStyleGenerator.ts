import { FrameStyle, ImageStyle, SVGStyle, TextStyle } from "@uimix/element-ir";

export type Props = Record<string, any>;

export interface IStyleGenerator {
  frameCSS(style: Partial<FrameStyle>): Props;
  imageCSS(style: Partial<ImageStyle>): Props;
  svgCSS(style: Partial<SVGStyle>): Props;
  textCSS(style: Partial<TextStyle>): Props;
}
