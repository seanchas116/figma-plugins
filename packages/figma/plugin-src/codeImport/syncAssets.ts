import parseCSSColor from "parse-css-color";
import { CodeAssets, CodeComponentInfo } from "../../types/data";
import { findFontForWeight } from "../util/common";
import {
  getPaintStyleMetadata,
  setPaintStyleMetadata,
  getTextStyleMetadata,
  setTextStyleMetadata,
  getComponentInfo,
  setComponentInfo,
} from "../pluginData";
import { renderInstanceImage } from "./render";

const productName = "UIMix";

export async function syncAssets(assets: CodeAssets) {
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
    style.name = name;
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
    style.name = name;
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
  for (const page of figma.root.children) {
    for (const node of page.children) {
      if (node.type === "COMPONENT") {
        const info = getComponentInfo(node);
        if (info) {
          components.set(CodeComponentInfo.key(info), node);
        }
      }
    }
  }

  let componentPage = figma.root.findChild((page) => page.name === productName);
  if (!componentPage) {
    componentPage = figma.createPage();
    componentPage.name = productName;
  }

  let offset = 0;

  for (const componentDoc of assets.components) {
    const key = CodeComponentInfo.key(componentDoc);
    let component = components.get(key);
    if (!component) {
      component = figma.createComponent();
      setComponentInfo(component, {
        externalPath: componentDoc.externalPath,
        internalPath: componentDoc.internalPath,
        name: componentDoc.name,
      });
      componentPage.appendChild(component);
    }
    component.name = componentDoc.name;
    component.x = 0;
    component.y = offset;

    const result = await renderInstanceImage({
      component: {
        externalPath: componentDoc.externalPath,
        internalPath: componentDoc.internalPath,
        name: componentDoc.name,
      },
      props: {},
      autoResize: "none",
    });

    const img = await figma.createImage(new Uint8Array(result.png));
    component.fills = [
      { type: "IMAGE", imageHash: img.hash, scaleMode: "CROP" },
    ];
    component.resize(result.width, result.height);

    offset += result.height + 32;
  }
}
