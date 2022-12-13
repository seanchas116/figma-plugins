import { MessageToPlugin } from "../message";

figma.showUI(__html__, { width: 240, height: 240 });

figma.ui.onmessage = async (msg: MessageToPlugin) => {
  // TODO
};
