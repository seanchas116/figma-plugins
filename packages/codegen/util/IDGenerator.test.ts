import { describe, expect, it } from "vitest";
import { IDGenerator } from "./IDGenerator";

describe(IDGenerator.name, () => {
  it("generates unique identifier from text", () => {
    const generator = new IDGenerator();

    expect(generator.generate("foo")).toEqual("foo");
    expect(generator.generate("foo")).toEqual("foo1");
    expect(generator.generate("Foo")).toEqual("Foo2");
  });
});
