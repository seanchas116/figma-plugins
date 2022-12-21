import { signal } from "@preact/signals";
import { ComponentDoc } from "react-docgen-typescript";
import { InstanceInfo, TargetInfo } from "../data";
import { MessageToUI } from "../message";
import { postMessageToPlugin } from "./common";

class State {
  private _componentDocs = signal<ComponentDoc[]>([]);
  private _target = signal<TargetInfo | undefined>(undefined);

  get componentDocs() {
    return this._componentDocs.value;
  }
  set componentDocs(value: ComponentDoc[]) {
    this._componentDocs.value = value;
  }

  get target() {
    return this._target.value;
  }

  constructor() {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;
        if (message.type === "targetChanged") {
          this._target.value = message.payload.target;
        }
      }
    });
  }

  updateInstance(instance: InstanceInfo) {
    if (!this.target) {
      return;
    }

    this._target.value = {
      component: this.target.component,
      instance,
    };

    postMessageToPlugin({
      type: "updateInstance",
      payload: {
        instance: instance,
      },
    });
  }

  updateInstanceProps(values: Record<string, any>) {
    if (!this.target) {
      return;
    }

    state.updateInstance({
      ...this.target.instance,
      props: {
        ...this.target.instance.props,
        ...values,
      },
    });
  }
}

export const state = new State();
