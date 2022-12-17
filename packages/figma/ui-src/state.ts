import { signal } from "@preact/signals";
import { ComponentState } from "../data";

class State {
  _component = signal<ComponentState | undefined>(undefined);
  get component() {
    return this._component.value;
  }
  set component(value) {
    this._component.value = value;
  }
}

export const state = new State();
