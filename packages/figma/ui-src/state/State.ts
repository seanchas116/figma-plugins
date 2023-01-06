import { signal } from "@preact/signals";
import { CodeAssets, CodeInstanceInfo, Target } from "../../types/data";
import { rpc } from "../rpc";

export const tabs = [
  { id: "insert", label: "Insert" },
  { id: "layer", label: "Layer" },
  { id: "code", label: "Code" },
  { id: "export", label: "Export" },
] as const;

class State {
  readonly $showsSettings = signal(false);
  readonly $assets = signal<CodeAssets>({
    components: [],
    colorStyles: {},
    textStyles: {},
  });
  readonly $target = signal<Target | undefined>(undefined);
  readonly $selectedTab = signal<typeof tabs[number]["id"]>("layer");

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

    this.$target.value = {
      ...this.target,
      instance,
    };

    rpc.remote.updateInstance(instance);
  }

  updateInstanceProps(values: Record<string, any>) {
    if (!this.target?.instance) {
      return;
    }
    const instance = this.target.instance;

    state.updateInstance({
      ...instance,
      props: {
        ...instance.props,
        ...values,
      },
    });
  }
}

export const state = new State();
