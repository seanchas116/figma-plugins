import { signal } from "@preact/signals";
import { ComponentDoc } from "react-docgen-typescript";
import { InstanceState } from "../data";
import { MessageToUI } from "../message";
import { postMessageToPlugin } from "./common";

class State {
  private _componentDocs = signal<ComponentDoc[]>([]);
  private _instance = signal<InstanceState | undefined>(undefined);

  get componentDocs() {
    return this._componentDocs.value;
  }
  set componentDocs(value: ComponentDoc[]) {
    this._componentDocs.value = value;
  }

  get instance() {
    return this._instance.value;
  }

  constructor() {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;
        if (message.type === "instanceChanged") {
          this._instance.value = message.payload.instance;
        }
      }
    });
  }

  updateInstance(instance?: InstanceState) {
    this._instance.value = instance;
    postMessageToPlugin({
      type: "updateInstance",
      payload: {
        instance: instance,
      },
    });
  }

  updateInstanceProps(values: Record<string, any>) {
    if (!this.instance) {
      return;
    }

    state.updateInstance({
      ...this.instance,
      props: {
        ...this.instance.props,
        ...values,
      },
    });
  }
}

export const state = new State();
