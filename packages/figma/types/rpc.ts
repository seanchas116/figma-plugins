import {
  CodeAssets,
  CodeComponentInfo,
  RenderResult,
  CodeInstanceParams,
  Target,
} from "./data";
import * as IR from "@uimix/element-ir";

export interface IUIToPluginRPC {
  ready(): Promise<void>;
  updateInstance(instance?: CodeInstanceParams): Promise<void>;
  syncCodeAssets(assets: CodeAssets): Promise<void>;
  resizeWindow(width: number, height: number): Promise<void>;
  exportWholeDocument(): Promise<IR.Component[]>;
  createResponsivePage(): Promise<void>;
  syncResponsiveContents(): Promise<void>;
  copyStylesToLargerScreens(): Promise<void>;
  copyStylesToSmallerScreens(): Promise<void>;
  getClientStorage(key: string): Promise<any>;
  setClientStorage(key: string, value: any): Promise<void>;
  notify(message: string): Promise<void>;
}

export interface IPluginToUIRPC {
  renderCodeComponent(
    component: CodeComponentInfo,
    props: Record<string, any>,
    width?: number,
    height?: number
  ): Promise<RenderResult>;
  onTargetsChange(targets: Target[]): Promise<void>;
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
