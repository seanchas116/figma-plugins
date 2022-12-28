import { ComponentDoc } from "react-docgen-typescript";
import { Assets, ColorStyleData, TextStyleData } from "./types";

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
      type: "assets";
      payload: Assets;
    };
