import { generateElements } from "@uimix/codegen";
import { computed, makeObservable, observable } from "mobx";
import { CodeAssets, CodeInstanceInfo, Target } from "../../types/data";
import { rpc } from "../rpc";
import { formatJS } from "../util/format";

export const tabs = [
  { id: "insert", label: "Insert" },
  { id: "layer", label: "Layer" },
  { id: "code", label: "Code" },
] as const;

class State {
  @observable showsSettings = false;

  @observable.ref assets: CodeAssets = {
    components: [],
    colorStyles: {},
    textStyles: {},
  };

  @observable.ref target: Target | undefined = undefined;
  @observable selectedTab: (typeof tabs)[number]["id"] = "layer";

  @observable codeFormat: "json" | "html" = "json";

  constructor() {
    makeObservable(this);
  }

  @computed get code():
    | {
        content: string;
        type: "json" | "html" | "jsx";
      }
    | undefined {
    if (!this.target) {
      return;
    }

    if (this.codeFormat === "json") {
      return {
        content: formatJS(JSON.stringify(this.target?.elementIR)),
        type: "json",
      };
    }

    // TODO: other formats

    const elements = this.target?.elementIR ?? [];
    const code = generateElements(elements, "tailwind");

    return { content: code, type: "jsx" };
  }

  get componentDocs() {
    return this.assets.components;
  }

  updateInstance(instance: CodeInstanceInfo) {
    if (!this.target) {
      return;
    }

    this.target = {
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
