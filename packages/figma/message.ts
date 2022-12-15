import { ComponentState } from "./data";

export type MessageToPlugin =
  | {
      type: "ready";
    }
  | {
      type: "updateComponent";
      payload: {
        component?: ComponentState;
      };
    }
  | {
      type: "renderDone";
      payload: {
        png: ArrayBuffer;
      };
    };

export type MessageToUI =
  | {
      type: "render";
      width: number;
      height: number;
    }
  | {
      type: "componentChanged";
      payload: {
        component?: ComponentState;
      };
    };
