import { describe, expect, it } from "vitest";
import { Component } from "@uimix/element-ir";

import _components from "./__fixtures__/components.json";
import { ProjectGenerator } from "./ProjectGenerator";
const components: Component[] = _components as any;

describe("Generator", () => {
  for (const style of ["tailwind", "inline", "css"] as const) {
    for (const includesFontFamily of [true, false] as const) {
      it(`should emit ${style} ${
        includesFontFamily ? "with" : "without"
      } font family`, () => {
        const generator = new ProjectGenerator({
          components,
          config: {
            style: style,
            includesFontFamily,
          },
        });

        expect(generator.generate()).toMatchSnapshot();
      });
    }
  }
});
