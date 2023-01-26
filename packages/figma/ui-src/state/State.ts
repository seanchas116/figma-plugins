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
  iconPrefix?: string;
  iconSubset?: { prefix: string; suffix: string };
  starredIconPrefixes?: string[];
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

  @observable iconPrefix: string | undefined = undefined;
  @observable.ref iconSubset: StateData["iconSubset"] = undefined;
  readonly starredIconPrefixes = observable.set<string>();

  constructor() {
    makeObservable(this);
    void this.saveRestoreState();
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
        void rpc.remote.setClientStorage("state", data);
      }
    );
  }

  private loadStateData(data: StateData) {
    this.selectedTab = data.selectedTab ?? "design";
    this.codeFormat = data.codeFormat ?? "html";
    this.iconPrefix = data.iconPrefix;
    this.iconSubset = data.iconSubset;
    this.starredIconPrefixes.replace(data.starredIconPrefixes ?? []);
  }

  private toStateData(): StateData {
    return {
      selectedTab: this.selectedTab,
      codeFormat: this.codeFormat,
      iconPrefix: this.iconPrefix,
      iconSubset: this.iconSubset,
      starredIconPrefixes: Array.from(this.starredIconPrefixes),
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

    void rpc.remote.updateInstance(instance);
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
