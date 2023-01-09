export interface Component {
  key?: string;
  element: Element;
  propertyDefinitions: PropertyDefinition[];
}

export interface PropertyDefinition {
  key: string;
  type: PropertyType;
}

export type PropertyType =
  | {
      type: "boolean";
    }
  | {
      type: "string";
    }
  | {
      type: "enum";
      options: string[];
    }
  | {
      type: "instance";
    };
