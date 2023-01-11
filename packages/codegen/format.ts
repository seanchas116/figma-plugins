import type { Options } from "prettier";
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import parserHtml from "prettier/parser-html";
import parsePostCSS from "prettier/parser-postcss";

const commonOptions: Options = {
  //printWidth: 120,
};

export function formatJS(value: string): string {
  return prettier.format(value, {
    ...commonOptions,
    parser: "babel",
    plugins: [parserBabel],
  });
}

export function formatHTML(value: string): string {
  return prettier.format(value, {
    ...commonOptions,
    parser: "html",
    plugins: [parserHtml],
  });
}

export function formatCSS(value: string): string {
  return prettier.format(value, {
    ...commonOptions,
    parser: "css",
    plugins: [parsePostCSS],
  });
}
