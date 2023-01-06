import {
  CodeInstanceInfo,
  CodeAssets,
  CodeComponentInfo,
  RenderResult,
  CodeInstanceParams,
} from "./data";

export interface IUIToPluginRPC {
  ready(): Promise<void>;
  updateInstance(instance?: CodeInstanceParams): Promise<void>;
  syncCodeAssets(assets: CodeAssets): Promise<void>;
  resize(width: number, height: number): Promise<void>;
}

export interface IPluginToUIRPC {
  renderCodeComponent(
    component: CodeComponentInfo,
    props: Record<string, any>,
    width?: number,
    height?: number
  ): Promise<RenderResult>;
  onTargetChange(target: CodeInstanceInfo | undefined): Promise<void>;
}

export interface UIToCodeComponentIFrameRPC {
  render(
    component: CodeComponentInfo,
    props: Record<string, any>,
    width?: number,
    height?: number
  ): Promise<RenderResult>;
}

export interface CodeComponentIFrameToUIRPC {
  assets(assets: CodeAssets): Promise<void>;
}
