import {
  CodeInstanceInfo,
  Assets,
  CodeComponentInfo,
  RenderResult,
  CodeInstanceParams,
} from "./data";

export interface IUIToPluginRPC {
  ready(): Promise<void>;
  updateInstance(instance?: CodeInstanceParams): Promise<void>;
  syncAssets(assets: Assets): Promise<void>;
  resize(width: number, height: number): Promise<void>;
}

export interface IPluginToUIRPC {
  render(
    component: CodeComponentInfo,
    props: Record<string, any>,
    width?: number,
    height?: number
  ): Promise<RenderResult>;
  onTargetChange(target: CodeInstanceInfo | undefined): Promise<void>;
}

export interface UIToRenderIFrameRPC {
  render(
    component: CodeComponentInfo,
    props: Record<string, any>,
    width?: number,
    height?: number
  ): Promise<RenderResult>;
}

export interface RenderIFrameToUIRPC {
  assets(assets: Assets): Promise<void>;
}
