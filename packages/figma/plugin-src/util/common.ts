import compare from "just-compare";

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

export function getPropertyDescriptor(
  obj: any,
  key: string
): PropertyDescriptor | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor) {
    return descriptor;
  }
  const proto = Object.getPrototypeOf(obj);
  if (proto) {
    return getPropertyDescriptor(proto, key);
  }
}

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

export function parseFontName(font: FontName): {
  family: string;
  weight: number;
  italic: boolean;
} {
  const style = font.style.toLowerCase();
  const styleWithoutItalic = style.replace("italic", "").replace(/\s+/g, "");

  const weight = fontWeightForName[styleWithoutItalic] ?? 400;
  const italic = style.includes("italic");

  return {
    family: font.family,
    weight,
    italic,
  };
}

export function omit<T, K extends string>(obj: T, keys: K[]): Omit<T, K> {
  const result: any = {};
  for (const key in obj) {
    if (!keys.includes(key as any)) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function diffObjects<T extends object>(from: T, to: T): Partial<T> {
  const diff: Partial<T> = {};
  for (const [key, value] of Object.entries(to)) {
    if (!compare(from[key as keyof T], value)) {
      diff[key as keyof T] = value;
    }
  }
  return diff;
}
