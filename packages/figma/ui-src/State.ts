import { signal } from "@preact/signals";
import { ComponentDoc } from "react-docgen-typescript";
import { ComponentState } from "../data";

class State {
  private _componentDocs = signal<ComponentDoc[]>([]);
  private _component = signal<ComponentState | undefined>(undefined);

  get componentDocs() {
    return this._componentDocs.value;
  }
  set componentDocs(value) {
    this._componentDocs.value = value;
  }

  get component() {
    return this._component.value;
  }
  set component(value) {
    this._component.value = value;
  }
}

export const state = new State();
