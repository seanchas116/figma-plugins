import { signal } from "@preact/signals";
import { Assets, InstanceInfo, TargetInfo } from "../../types/data";
import { rpc } from "../rpc";

class State {
  readonly $showsSettings = signal(false);
  readonly $assets = signal<Assets>({
    components: [],
    colorStyles: {},
    textStyles: {},
  });
  readonly $target = signal<TargetInfo | undefined>(undefined);

  get componentDocs() {
    return this.$assets.value.components;
  }

  get target() {
    return this.$target.value;
  }

  constructor() {}

  updateInstance(instance: InstanceInfo) {
    if (!this.target) {
      return;
    }

    this.$target.value = {
      component: this.target.component,
      instance,
    };

    rpc.remote.updateInstance(instance);
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
