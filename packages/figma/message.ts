import { InstanceInfo, TargetInfo, Assets } from "./data";

export type MessageToPlugin =
  | {
      type: "ready";
    }
  | {
      type: "updateInstance";
      payload: {
        instance?: InstanceInfo;
      };
    }
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
      type: "syncAssets";
      payload: {
        assets: Assets;
      };
    }
  | {
      type: "resize";
      payload: {
        width: number;
        height: number;
      };
    };

export type MessageToUI =
  | {
      type: "render";
      requestID: number;
      payload: {
        path: string;
        name: string;
        props: Record<string, any>;
        width?: number;
        height?: number;
      };
    }
  | {
      type: "targetChanged";
      payload: {
        target?: TargetInfo;
      };
    };
