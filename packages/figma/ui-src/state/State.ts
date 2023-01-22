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

  @observable.ref targets: readonly Target[] = [];
  @observable selectedTab: SelectedTab = "design";

  @observable codeFormat: CodeFormat = "html";

  @observable iconCollectionPrefix: string | undefined = undefined;
  @observable.ref iconSubset: StateData["iconSubset"] = undefined;

  constructor() {
    makeObservable(this);
    this.saveRestoreState();
  }

  private async saveRestoreState() {
    const data = await rpc.remote.getClientStorage("state");
    // TODO: use zod?
    if (data) {
      this.loadStateData(data);
    }

    reaction(
      () => this.toStateData(),
      (data) => {
        rpc.remote.setClientStorage("state", data);
      }
    );
  }

  private loadStateData(data: StateData) {
    this.selectedTab = data.selectedTab ?? "design";
    this.codeFormat = data.codeFormat ?? "html";
    this.iconCollectionPrefix = data.iconCollectionPrefix;
    this.iconSubset = data.iconSubset;
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
    const elementIR = this.targets.flatMap((t) => t.elementIR);
    if (elementIR.length === 0) {
      return;
    }

    if (this.codeFormat === "json") {
      return {
        content: formatJS(JSON.stringify(elementIR)),
        type: "json",
      };
    }

    // TODO: other formats

    const code = generateElements(elementIR, {
      style: "tailwind",
      includesFontFamily: false,
    });

    return { content: code, type: "jsx" };
  }

  get componentDocs() {
    return this.assets.components;
  }

  updateInstance(instance: CodeInstanceInfo) {
    if (this.targets?.length !== 1) {
      return;
    }

    this.targets = [
      {
        ...this.targets[0],
        instance,
      },
    ];

    rpc.remote.updateInstance(instance);
  }

  updateInstanceProps(values: Record<string, any>) {
    if (this.targets?.length !== 1) {
      return;
    }
    const target = this.targets[0];

    if (!target.instance) {
      return;
    }
    const instance = target.instance;

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
