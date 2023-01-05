import { InstanceInfo, TargetInfo, Assets, ComponentInfo } from "./data";

interface UIToPluginRPC {
  ready(): Promise<void>;
  updateInstance(instance?: InstanceInfo): Promise<void>;
  syncAssets(assets: Assets): Promise<void>;
  resize(width: number, height: number): Promise<void>;
}

interface PluginToUIRPC {
  render(
    component: ComponentInfo,
    props: Record<string, any>,
    width?: number,
    height?: number
  ): Promise<{
    png: ArrayBuffer;
    width: number;
    height: number;
  }>;
  onTargetChange(target: TargetInfo | undefined): Promise<void>;
}

export type UIToPluginMessage =
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

export type PluginToUIMessage =
  | {
      type: "render";
      requestID: number;
      payload: {
        component: ComponentInfo;
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

export type UIToRenderIFrameMessage = {
  type: "render";
  requestID: number;
  payload: {
    component: ComponentInfo;
    props: Record<string, any>;
    width?: number;
    height?: number;
  };
};

export type RenderIFrameToUIMessage =
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
