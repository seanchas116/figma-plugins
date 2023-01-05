import { InstanceInfo, TargetInfo, Assets, ComponentInfo } from "./data";

export interface IUIToPluginRPC {
  ready(): Promise<void>;
  updateInstance(instance?: InstanceInfo): Promise<void>;
  syncAssets(assets: Assets): Promise<void>;
  resize(width: number, height: number): Promise<void>;
}

export interface IPluginToUIRPC {
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

export interface UIToRenderIFrameRPC {
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
}

export interface RenderIFrameToUIRPC {
  assets(assets: Assets): Promise<void>;
}
