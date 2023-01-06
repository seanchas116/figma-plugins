import { FrameStyle, ImageStyle, SVGStyle, TextStyle } from "./style";

interface CommonProps {
  id: string;
  name: string;
}

export interface FrameElement extends CommonProps {
  type: "frame";
  style: FrameStyle;
  children: Element[];
}

export interface TextElement extends CommonProps {
  type: "text";
  style: TextStyle;
  content: string; // TODO: spans
}

export interface ImageElement extends CommonProps {
  type: "image";
  style: ImageStyle;
  imageID: string;
}

export interface SVGElement extends CommonProps {
  type: "svg";
  style: SVGStyle;
  svg: string;
}

export type Element = FrameElement | TextElement | ImageElement | SVGElement;
