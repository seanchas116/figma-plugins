import { describe, expect, it } from "vitest";
import { Generator } from "./Generator";
import { Component } from "@uimix/element-ir";

import _components from "./__fixtures__/components.json";
const components: Component[] = _components as any;

describe("Generator", () => {
  it("should work", () => {
    const generator = new Generator({
      components,
    });

    expect(generator.generateProject()).toMatchSnapshot();
  });
});
