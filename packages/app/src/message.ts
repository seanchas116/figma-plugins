import { ComponentDoc } from "react-docgen-typescript";

export type MessageToRenderIFrame = {
  type: "render";
  requestID: number;
  payload: {
    path: string;
    name: string;
    props: Record<string, any>;
    width?: number;
    height?: number;
  };
};

export type MessageFromRenderIFrame =
  | {
      type: "renderDone";
      requestID: number;
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
