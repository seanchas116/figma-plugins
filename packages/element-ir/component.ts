export interface Component {
  key: string;
  element: Element;
  propertyDefinitions: PropertyDefinition[];
}

export interface PropertyDefinition {
  key: string;
  type:
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
}
