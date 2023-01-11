import resolveConfig from "tailwindcss/resolveConfig";
import defaultConfig from "tailwindcss/defaultConfig";
import { colorToCSS } from "./common";
import { Color } from "@uimix/element-ir";
const defaultTheme = resolveConfig(defaultConfig).theme!;

function flattenTheme(theme: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {};

  function flatten(obj: Record<string, any>, prefix: string = "") {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === "object") {
        flatten(value, `${prefix}${key}-`);
      } else {
        result[`${prefix}${key}`] = value;
      }
    }
  }

  flatten(theme);
  return result;
}

export class TailwindKeywordResolver {
  readonly theme = defaultTheme;

  constructor() {
    for (const [keyword, value] of Object.entries(this.theme.spacing ?? {})) {
      this.spacingKeywords.set(value, keyword);
    }

    for (const [keyword, value] of Object.entries(
      this.theme.lineHeight ?? {}
    )) {
      this.lineHeightKeywords.set(value, keyword);
    }

    for (const [keyword, value] of Object.entries(
      this.theme.letterSpacing ?? {}
    )) {
      this.letterSpacingKeywords.set(value, keyword);
    }

    for (const [keyword, value] of Object.entries(
      this.theme.fontWeight ?? {}
    )) {
      this.fontWeightKeywords.set(value, keyword);
    }

    for (const [keyword, value] of Object.entries(this.theme.fontSize ?? {})) {
      this.fontSizeKeywords.set(value[0], keyword);
    }

    for (const [keyword, value] of Object.entries(
      this.theme.borderWidth ?? {}
    )) {
      this.borderWidthKeywords.set(value, keyword);
    }

    for (const [keyword, value] of Object.entries(
      this.theme.borderRadius ?? {}
    )) {
      this.borderRadiusKeywords.set(value, keyword);
    }

    for (const [keyword, value] of Object.entries(
      flattenTheme(this.theme.colors ?? {})
    )) {
      // TODO: normalize hex
      this.colorKeywords.set(value.toLowerCase(), keyword);
    }
  }

  private spacingKeywords = new Map<string, string>();
  private lineHeightKeywords = new Map<string, string>();
  private letterSpacingKeywords = new Map<string, string>();
  private fontWeightKeywords = new Map<string, string>();
  private fontSizeKeywords = new Map<string, string>();
  private borderWidthKeywords = new Map<string, string>();
  private borderRadiusKeywords = new Map<string, string>();
  private colorKeywords = new Map<string, string>();

  spacing(value: number): string {
    return this.resolve(this.spacingKeywords, [
      `${value / 16}rem`,
      `${value}px`,
    ]);
  }

  lineHeightPx(value: number): string {
    return this.resolve(this.lineHeightKeywords, [
      `${value / 16}rem`,
      `${value}px`,
    ]);
  }

  lineHeight(value: number): string {
    return this.resolve(this.lineHeightKeywords, [`${value}`]);
  }

  letterSpacing(value: number): string {
    return this.resolve(this.letterSpacingKeywords, [`${value}em`]);
  }

  fontWeight(value: number): string {
    return this.resolve(this.fontWeightKeywords, [`${value}`]);
  }

  fontSize(value: number): string {
    return this.resolve(this.fontSizeKeywords, [
      `${value / 16}rem`,
      `${value}px`,
    ]);
  }

  borderWidth(value: number): string {
    return this.resolve(this.borderWidthKeywords, [`${value}px`]);
  }

  borderRadius(value: number): string {
    return this.resolve(this.borderRadiusKeywords, [
      `${value / 16}rem`,
      `${value}px`,
    ]);
  }

  color(color: Color): string {
    let hex = colorToCSS(color);

    hex = hex.toLowerCase();

    if (hex.length === 9 && hex.endsWith("ff")) {
      hex = hex.slice(0, 7);
    }

    if (hex === "#ffffff") {
      return "-white";
    }
    if (hex === "#000000") {
      return "-black";
    }
    if (hex.length === 9 && hex.endsWith("00")) {
      return "-transparent";
    }

    return this.resolve(this.colorKeywords, [hex]);
  }

  resolve(keywords: Map<string, string>, values: string[]): string {
    for (const value of values) {
      const keyword = keywords.get(value);
      if (keyword === "DEFAULT") {
        return "";
      }
      if (keyword) {
        return `-${keyword}`;
      }
    }
    return `-[${values[0]}]`;
  }
}
