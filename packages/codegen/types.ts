import { PropertyDefinition, Component, Element } from "@uimix/element-ir";

export interface ExtendedPropertyDefinition extends PropertyDefinition {
  inCodeName: string;
}

export interface ExtendedComponent extends Component {
  inCodeName: string;
  propertyForName: Map<string, ExtendedPropertyDefinition>;
}

export interface GeneratedFile {
  filePath: string;
  content: string;
}

export interface IStyleGenerator {
  generate(
    element: Element,
    opts: {
      isRoot: boolean;
    }
  ): string[];

  additionalImports?(): string[];
  additionalFiles?(): GeneratedFile[];
}
