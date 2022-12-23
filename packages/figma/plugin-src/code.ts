import { InstanceInfo, TargetInfo } from "../data";
import { MessageToPlugin } from "../message";
import {
  setInstanceInfo,
  getComponentInfo,
  setComponentInfo,
  getRenderedSize,
  getTargetInfo,
  getPaintStyleMetadata,
  setPaintStyleMetadata,
  getTextStyleMetadata,
  setTextStyleMetadata,
} from "./pluginData";
import { debounce, findFontForWeight, postMessageToUI } from "./common";
import { onRenderDone, renderInstance, renderInstanceImage } from "./render";
import parseCSSColor from "parse-css-color";

const productName = "UIInspect";

figma.showUI(__html__, { width: 240, height: 240 });

figma.ui.onmessage = async (msg: MessageToPlugin) => {
  switch (msg.type) {
    case "ready": {
      onSelectionChange();
      break;
    }
    case "resize": {
      figma.ui.resize(msg.payload.width, msg.payload.height);
      break;
    }
    case "updateInstance": {
      console.log(msg);

      const selection = figma.currentPage.selection;
      if (!selection.length) {
        return;
      }

      const node = selection[0];
      if (node.type !== "INSTANCE") {
        return;
      }

      console.log("setting instance info", msg.payload.instance);

      const instanceInfo = msg.payload.instance;
      setInstanceInfo(node, instanceInfo);
      if (instanceInfo) {
        node.setRelaunchData({
          edit: "",
        });
        renderInstance(node);
      } else {
        node.setRelaunchData({});
      }

      break;
    }

    case "renderDone": {
      onRenderDone(msg.requestID, msg.payload);
      break;
    }

    case "syncAssets": {
      // TODO: generate components

      let page = figma.root.findChild((page) => page.name === productName);
      if (!page) {
        page = figma.createPage();
        page.name = productName;
      }

      const assets = msg.payload.assets;

      const paintStyles = new Map<string, PaintStyle>();

      for (const style of figma.getLocalPaintStyles()) {
        const metadata = getPaintStyleMetadata(style);
        if (metadata) {
          paintStyles.set(metadata.name, style);
        }
      }

      for (const [name, value] of Object.entries(assets.colorStyles)) {
        let style = paintStyles.get(name);
        if (!style) {
          style = figma.createPaintStyle();
          setPaintStyleMetadata(style, { name });
        }
        style.name = `${productName}/${name}`;
        const color = parseCSSColor(value);
        if (color?.type === "rgb") {
          // TODO: support other color types
          style.paints = [
            {
              type: "SOLID",
              color: {
                r: color.values[0] / 255,
                g: color.values[1] / 255,
                b: color.values[2] / 255,
              },
              opacity: color.alpha,
            },
          ];
        }

        style.description = value;
      }

      const textStyles = new Map<string, TextStyle>();
      for (const style of figma.getLocalTextStyles()) {
        const metadata = getTextStyleMetadata(style);
        if (metadata) {
          textStyles.set(metadata.name, style);
        }
      }

      const allFonts = await figma.listAvailableFontsAsync();

      for (const [name, value] of Object.entries(assets.textStyles)) {
        let style = textStyles.get(name);
        if (!style) {
          style = figma.createTextStyle();
          setTextStyleMetadata(style, { name });
        }
        style.name = `${productName}/${name}`;

        try {
          const fonts = allFonts
            .filter((font) => font.fontName.family === value.fontFamily)
            .map((font) => font.fontName);

          const font = findFontForWeight(fonts, value.fontWeight);
          await figma.loadFontAsync(font);
          style.fontName = font;
          style.fontSize = value.fontSize;
          style.lineHeight = value.lineHeight
            ? {
                unit: "PERCENT",
                value: value.lineHeight * 100,
              }
            : {
                unit: "AUTO",
              };
          style.letterSpacing = {
            unit: "PERCENT",
            value: (value.letterSpacing ?? 0) * 100,
          };
        } catch (e) {
          console.error(e);
        }
      }

      const components = new Map<string, ComponentNode>();
      for (const node of page.children) {
        if (node.type === "COMPONENT") {
          const info = getComponentInfo(node);
          if (info) {
            components.set(info.path + "#" + info.name, node);
          }
        }
      }

      for (const componentDoc of assets.components) {
        const key = componentDoc.filePath + "#" + componentDoc.displayName;
        let component = components.get(key);
        if (!component) {
          component = figma.createComponent();
          setComponentInfo(component, {
            path: componentDoc.filePath,
            name: componentDoc.displayName,
          });
          page.appendChild(component);
        }
        component.name = `${productName}/${componentDoc.displayName}`;

        const result = await renderInstanceImage({
          component: {
            path: componentDoc.filePath,
            name: componentDoc.displayName,
          },
          instance: {
            props: {},
            autoResize: "none",
          },
        });

        const img = await figma.createImage(new Uint8Array(result.png));
        component.fills = [
          { type: "IMAGE", imageHash: img.hash, scaleMode: "CROP" },
        ];
        component.resize(result.width, result.height);
      }

      figma.notify("Components & tokens synced to your Figma file!");
      break;
    }
  }
};

const onDocumentChange = debounce((event: DocumentChangeEvent) => {
  for (const change of event.documentChanges) {
    console.log(change);
    if (
      change.type === "PROPERTY_CHANGE" &&
      change.node.type === "INSTANCE" &&
      !change.node.removed &&
      (change.properties.includes("width") ||
        change.properties.includes("height"))
    ) {
      const node = change.node;
      const target = getTargetInfo(node);
      if (!target) {
        continue;
      }

      const renderedSize = getRenderedSize(node);
      if (
        renderedSize &&
        renderedSize.width === node.width &&
        renderedSize.height === node.height
      ) {
        continue;
      }

      if (target.instance.autoResize !== "none") {
        const newAutoResize = change.properties.includes("height")
          ? "none"
          : "height";

        const newInstanceInfo: InstanceInfo = {
          ...target.instance,
          autoResize: newAutoResize,
        };

        setInstanceInfo(node, newInstanceInfo);
        postMessageToUI({
          type: "targetChanged",
          payload: {
            target: {
              ...target,
              instance: newInstanceInfo,
            },
          },
        });
      }

      renderInstance(node);
    }
  }
}, 200);

const onSelectionChange = () => {
  const selection = figma.currentPage.selection;

  let target: TargetInfo | undefined;

  if (selection.length > 0) {
    const current = selection[0];
    if (current.type === "INSTANCE") {
      target = getTargetInfo(current);
    }
  }

  postMessageToUI({
    type: "targetChanged",
    payload: {
      target,
    },
  });
};

figma.on("documentchange", onDocumentChange);
figma.on("selectionchange", onSelectionChange);
