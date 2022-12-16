import { ComponentDoc } from "react-docgen-typescript";

export type MessageToRenderIFrame = {
  type: "render";
  payload: {
    name: string;
    props: Record<string, any>;
    width?: number;
    height?: number;
  };
};

export type MessageFromRenderIFrame =
  | {
      type: "renderDone";
      payload: {
        png: ArrayBuffer;
        width: number;
        height: number;
      };
    }
  | {
      type: "components";
      payload: {
        components: ComponentDoc[];
      };
    };
