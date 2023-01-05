import { signal } from "@preact/signals";
import { Assets, InstanceInfo, TargetInfo } from "../../data";
import { onMessageFromPlugin, postMessageToPlugin } from "../common";

class State {
  readonly $showsSettings = signal(false);
  readonly $assets = signal<Assets>({
    components: [],
    colorStyles: {},
    textStyles: {},
  });
  private readonly $target = signal<TargetInfo | undefined>(undefined);

  get componentDocs() {
    return this.$assets.value.components;
  }

  get target() {
    return this.$target.value;
  }

  constructor() {
    onMessageFromPlugin((message) => {
      if (message.type === "targetChanged") {
        this.$target.value = message.payload.target;
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
