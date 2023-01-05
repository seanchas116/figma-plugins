import { PluginToUIMessage } from "../message";

export function postMessageToUI(msg: PluginToUIMessage) {
  figma.ui.postMessage(msg);
}

export const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout | undefined;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = undefined;
    }, delay);
  };
};

const fontWeightForName: Record<string, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
  w1: 100,
  w2: 200,
  w3: 300,
  w4: 400,
  w5: 500,
  w6: 600,
  w7: 700,
  w8: 800,
  w9: 900,
};

export function findFontForWeight(fonts: FontName[], weight: number): FontName {
  const candidates: [FontName, number][] = [];

  for (const font of fonts) {
    const style = font.style.toLowerCase().trim();
    const words = style.split(/\s+/);
    if (words.length !== 1) {
      continue;
    }
    const styleName = words[0];
    const styleWeight = fontWeightForName[styleName];

    if (styleWeight) {
      candidates.push([font, styleWeight]);
    }
  }

  candidates.sort((a, b) => a[1] - b[1]);

  for (const [font, styleWeight] of candidates) {
    if (styleWeight >= weight) {
      return font;
    }
  }

  return fonts[0];
}

export function encodeNode(node: BaseNode): Omit<BaseNode, "parent"> {
  const result: Record<string, any> = {};

  for (const key in node) {
    const value = (node as any)[key];

    if (key === "parent") {
      continue;
    }
    if (key === "children") {
      result[key] = value.map(encodeNode);
      continue;
    }
    if (typeof value === "function") {
      continue;
    }
    result[key] = value;
  }
  return result as Omit<BaseNode, "parent">;
}
