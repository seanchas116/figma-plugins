import parseCSSColor from "parse-css-color";
import { Assets } from "../data";
import { findFontForWeight } from "./common";
import {
  getPaintStyleMetadata,
  setPaintStyleMetadata,
  getTextStyleMetadata,
  setTextStyleMetadata,
  getComponentInfo,
  setComponentInfo,
} from "./pluginData";
import { renderInstanceImage } from "./render";

const productName = "UIInspect";

export async function syncAssets(assets: Assets) {
  let page = figma.root.findChild((page) => page.name === productName);
  if (!page) {
    page = figma.createPage();
    page.name = productName;
  }

  const paintStyles = new Map<string, PaintStyle>();

  for (const style of figma.getLocalPaintStyles()) {
    const metadata = getPaintStyleMetadata(style);
    if (metadata) {
      paintStyles.set(metadata.name, style);
    }
  }

  for (const [name, { value, comment }] of Object.entries(assets.colorStyles)) {
    let style = paintStyles.get(name);
    if (!style) {
      style = figma.createPaintStyle();
      setPaintStyleMetadata(style, { name });
    }
    style.name = `${productName}/${name}`;
    style.description = comment ?? "";
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
  }

  const textStyles = new Map<string, TextStyle>();
  for (const style of figma.getLocalTextStyles()) {
    const metadata = getTextStyleMetadata(style);
    if (metadata) {
      textStyles.set(metadata.name, style);
    }
  }

  const allFonts = await figma.listAvailableFontsAsync();

  for (const [name, { value, comment }] of Object.entries(assets.textStyles)) {
    let style = textStyles.get(name);
    if (!style) {
      style = figma.createTextStyle();
      setTextStyleMetadata(style, { name });
    }
    style.name = `${productName}/${name}`;
    style.description = comment ?? "";

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
}
