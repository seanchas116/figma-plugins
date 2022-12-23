import { signal } from "@preact/signals";
import { ComponentDoc } from "react-docgen-typescript";
import {
  ColorStyleData,
  InstanceInfo,
  TargetInfo,
  TextStyleData,
} from "../data";
import { MessageToUI } from "../message";
import { postMessageToPlugin } from "./common";

class State {
  $assets = signal<{
    components: ComponentDoc[];
    colorStyles: Record<string, ColorStyleData>;
    textStyles: Record<string, TextStyleData>;
  }>({
    components: [],
    colorStyles: {},
    textStyles: {},
  });
  private $target = signal<TargetInfo | undefined>(undefined);

  get componentDocs() {
    return this.$assets.value.components;
  }

  get target() {
    return this.$target.value;
  }

  constructor() {
    window.addEventListener("message", (event) => {
      if (event.data.pluginMessage) {
        const message = event.data.pluginMessage as MessageToUI;
        if (message.type === "targetChanged") {
          this.$target.value = message.payload.target;
        }
      }
    });
  }

  updateInstance(instance: InstanceInfo) {
    if (!this.target) {
      return;
    }

    this.$target.value = {
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
