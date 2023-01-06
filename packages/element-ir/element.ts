export interface FrameElement {
  type: "frame";
  style: FrameStyle;
  children: Element[];
}

export interface TextElement {
  type: "text";
  style: TextStyle;
}

export interface ImageElement {
  type: "image";
  style: ImageStyle;
  imageID: string;
}

export interface SVGElement {
  type: "svg";
  style: ImageStyle;
  svg: string;
}

export type Element = FrameElement | TextElement | ImageElement | SVGElement;
