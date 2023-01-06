import { signal } from "@preact/signals";
import { Assets, CodeInstanceInfo } from "../../types/data";
import { rpc } from "../rpc";

class State {
  readonly $showsSettings = signal(false);
  readonly $assets = signal<Assets>({
    components: [],
    colorStyles: {},
    textStyles: {},
  });
  readonly $target = signal<CodeInstanceInfo | undefined>(undefined);

  get componentDocs() {
    return this.$assets.value.components;
  }

  get target() {
    return this.$target.value;
  }

  constructor() {}

  updateInstance(instance: CodeInstanceInfo) {
    if (!this.target) {
      return;
    }

    this.$target.value = instance;

    rpc.remote.updateInstance(instance);
  }

  updateInstanceProps(values: Record<string, any>) {
    if (!this.target) {
      return;
    }

    state.updateInstance({
      ...this.target,
      props: {
        ...this.target.props,
        ...values,
      },
    });
  }
}

export const state = new State();
