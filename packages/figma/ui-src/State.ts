import { signal } from "@preact/signals";
import { ComponentDoc } from "react-docgen-typescript";
import { ComponentState } from "../data";
import { MessageToUI } from "../message";
import { postMessageToPlugin } from "./common";

class State {
  private _componentDocs = signal<ComponentDoc[]>([]);
  private _component = signal<ComponentState | undefined>(undefined);

  get componentDocs() {
    return this._componentDocs.value;
  }
  set componentDocs(value: ComponentDoc[]) {
    this._componentDocs.value = value;
  }

  get component() {
    return this._component.value;
  }

  constructor() {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;
        if (message.type === "componentChanged") {
          this._component.value = message.payload.component;
        }
      }
    });
  }

  updateComponent(component?: ComponentState) {
    this._component.value = component;
    postMessageToPlugin({
      type: "updateComponent",
      payload: {
        component,
      },
    });
  }

  updateComponentProps(values: Record<string, any>) {
    if (!this.component) {
      return;
    }

    state.updateComponent({
      ...this.component,
      props: {
        ...this.component.props,
        ...values,
      },
    });
  }
}

export const state = new State();
