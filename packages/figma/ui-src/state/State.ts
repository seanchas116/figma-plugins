import { generateElements } from "@uimix/codegen";
import { computed, makeObservable, observable, reaction } from "mobx";
import { CodeAssets, CodeInstanceInfo, Target } from "../../types/data";
import { rpc } from "../rpc";
import { formatJS } from "../util/format";

type SelectedTab = "icons" | "design" | "code" | "export";
type CodeFormat = "json" | "html";

interface StateData {
  selectedTab?: SelectedTab;
  codeFormat?: "json" | "html";
  iconCollectionPrefix?: string;
  iconSubset?: { prefix: string; suffix: string };
}

export const tabs: {
  id: SelectedTab;
  label: string;
}[] = [
  { id: "icons", label: "Icons" },
  { id: "design", label: "Design" },
  { id: "code", label: "Code" },
  { id: "export", label: "Export" },
];

class State {
  @observable showsSettings = false;

  @observable.ref assets: CodeAssets = {
    components: [],
    colorStyles: {},
    textStyles: {},
  };

  @observable.ref target: Target | undefined = undefined;
  @observable selectedTab: SelectedTab = "design";

  @observable codeFormat: CodeFormat = "html";

  @observable iconCollectionPrefix: string | undefined = undefined;
  @observable.ref iconSubset: StateData["iconSubset"] = undefined;

  constructor() {
    makeObservable(this);
    this.restoreState();

    reaction(
      () => this.toStateData(),
      (data) => {
        rpc.remote.setClientStorage("state", data);
      }
    );
  }

  private async restoreState() {
    const data = await rpc.remote.getClientStorage("state");
    // TODO: use zod?
    if (data) {
      this.selectedTab = data.selectedTab ?? "design";
      this.codeFormat = data.codeFormat ?? "html";
      this.iconCollectionPrefix = data.iconCollectionPrefix;
      this.iconSubset = data.iconSubset;
    }
  }

  private toStateData(): StateData {
    return {
      selectedTab: this.selectedTab,
      codeFormat: this.codeFormat,
      iconCollectionPrefix: this.iconCollectionPrefix,
      iconSubset: this.iconSubset,
    };
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
