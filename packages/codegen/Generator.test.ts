import { describe, expect, it } from "vitest";
import { Generator } from "./Generator";
import { Component } from "@uimix/element-ir";

import _components from "./__fixtures__/components.json";
const components: Component[] = _components as any;

describe("Generator", () => {
  for (const style of ["tailwind", "inline"] as const) {
    it(`should emit ${style}`, () => {
      const generator = new Generator({
        components,
        style,
      });

      expect(generator.generateProject()).toMatchSnapshot();
    });
  }
});
