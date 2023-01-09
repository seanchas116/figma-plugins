import { Element } from "@uimix/element-ir";
import type * as hast from "hast";
import * as svgParser from "svg-parser";
import { h } from "hastscript";
import {
  ParentLayout,
  stringifyStyle,
  dimensionCSS,
  rectangleCSS,
  frameCSS,
  imageCSS,
  textSpanCSS,
  textCSS,
} from "./style";

export class Generator {
  generate(element: Element, parentLayout?: ParentLayout): hast.Content {
    switch (element.type) {
      case "instance": {
        // TODO
        return h("div", {
          "component-key": element.componentKey,
        });
      }
      case "frame": {
        return h(
          "div",
          {
            style: stringifyStyle({
              ...dimensionCSS(element.style, parentLayout),
              ...rectangleCSS(element.style),
              ...frameCSS(element.style),
            }),
          },
          ...element.children.map((e) =>
            this.generate(e, element.style.flexDirection)
          )
        );
      }
      case "image": {
        return h("img", {
          style: stringifyStyle({
            ...dimensionCSS(element.style, parentLayout),
            ...rectangleCSS(element.style),
            ...imageCSS(element.style),
          }),
        });
      }
      case "svg": {
        const root = svgParser.parse(element.svg) as hast.Root;
        const svgElem = root.children[0];
        if (svgElem.type !== "element") {
          throw new Error("Expected element type");
        }

        const properties: hast.Properties = {
          ...svgElem.properties,
          style: stringifyStyle({
            ...dimensionCSS(element.style, parentLayout),
          }),
        };
        delete properties.xmlns;
        return {
          ...svgElem,
          properties,
        };
      }
      case "text": {
        return h(
          "div",
          {
            style: stringifyStyle({
              ...dimensionCSS(element.style, parentLayout),
              ...textSpanCSS(element.style),
              ...textCSS(element.style),
            }),
          },
          element.content
        );
      }
    }
  }
}
