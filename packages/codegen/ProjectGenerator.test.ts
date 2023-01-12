import { describe, expect, it } from "vitest";
import { Component } from "@uimix/element-ir";

import _components from "./__fixtures__/components.json";
import { ProjectGenerator } from "./ProjectGenerator";
const components: Component[] = _components as any;

describe("Generator", () => {
  for (const style of ["tailwind", "inline", "css"] as const) {
    it(`should emit ${style}`, () => {
      const generator = new ProjectGenerator({
        components,
        style,
      });

      expect(generator.generate()).toMatchSnapshot();
    });
  }
});
