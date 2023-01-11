import { PropertyDefinition, Component } from "@uimix/element-ir";

export interface ExtendedPropertyDefinition extends PropertyDefinition {
  inCodeName: string;
}

export interface ExtendedComponent extends Component {
  inCodeName: string;
  propertyForName: Map<string, ExtendedPropertyDefinition>;
}
