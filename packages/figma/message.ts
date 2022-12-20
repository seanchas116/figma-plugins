import { InstanceState } from "./data";
import type { ComponentDoc } from "react-docgen-typescript";

export type MessageToPlugin =
  | {
      type: "ready";
    }
  | {
      type: "updateInstance";
      payload: {
        instance?: InstanceState;
      };
    }
  | {
      type: "renderDone";
      payload: {
        png: ArrayBuffer;
        width: number;
        height: number;
      };
    }
  | {
      type: "syncAssets";
      payload: {
        componentDocs?: ComponentDoc[];
      };
    };

export type MessageToUI =
  | {
      type: "render";
      payload: {
        path: string;
        name: string;
        props: Record<string, any>;
        width?: number;
        height?: number;
      };
    }
  | {
      type: "instanceChanged";
      payload: {
        instance?: InstanceState;
      };
    };
