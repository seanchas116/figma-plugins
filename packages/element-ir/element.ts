import {
  FrameStyle,
  ImageStyle,
  InstanceStyle,
  SVGStyle,
  TextStyle,
} from "./style";

export interface CommonProps {
  id: string;
  name: string;
  propertyRef: {
    visible?: string;
    content?: string;
    component?: string;
  };
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

export interface InstanceElement extends CommonProps {
  type: "instance";
  componentKey: string;
  properties: Record<string, any>;
  // overrides are not supported (instances are inlined if any overrides are present)
  style: InstanceStyle;
}

export type Element =
  | FrameElement
  | TextElement
  | ImageElement
  | SVGElement
  | InstanceElement;
