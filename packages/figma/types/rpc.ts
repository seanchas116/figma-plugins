import {
  InstanceInfo,
  ComponentInstanceInfo,
  Assets,
  ComponentInfo,
  RenderResult,
} from "./data";

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
  ): Promise<RenderResult>;
  onTargetChange(target: ComponentInstanceInfo | undefined): Promise<void>;
}

export interface UIToRenderIFrameRPC {
  render(
    component: ComponentInfo,
    props: Record<string, any>,
    width?: number,
    height?: number
  ): Promise<RenderResult>;
}

export interface RenderIFrameToUIRPC {
  assets(assets: Assets): Promise<void>;
}
