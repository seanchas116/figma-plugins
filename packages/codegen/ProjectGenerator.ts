import { Component } from "@uimix/element-ir";
import { camelCase, capitalize } from "lodash-es";
import {
  ExtendedComponent,
  ExtendedPropertyDefinition,
  GeneratedFile,
} from "./types";
import { ComponentGenerator } from "./ComponentGenerator";

export interface ProjectGeneratorOptions {
  style: "tailwind" | "inline" | "css" | "cssModules";
  components: Component[];
}

export class ProjectGenerator {
  constructor(options: ProjectGeneratorOptions) {
    for (const component of options.components) {
      const propertyForName = new Map<string, ExtendedPropertyDefinition>();

      for (const prop of component.propertyDefinitions) {
        const inCodeName = camelCase(prop.name.split("#")[0]);
        propertyForName.set(prop.name, {
          ...prop,
          inCodeName,
        });
      }

      const extendedComponent: ExtendedComponent = {
        ...component,
        inCodeName: capitalize(camelCase(component.element.name ?? "")),
        propertyForName,
      };

      if (component.key) {
        console.log("component.key", component.key);
        this.components.set(component.key, extendedComponent);
      }

      const componentGenerator = new ComponentGenerator(extendedComponent, {
        style: options.style,
        otherComponents: this.components,
      });
      this.componentGenerators.push(componentGenerator);
    }
  }

  readonly componentGenerators: ComponentGenerator[] = [];
  readonly components = new Map<string, ExtendedComponent>();

  generate(): GeneratedFile[] {
    return this.componentGenerators.flatMap((c) => c.generate());
  }
}
