import { signal } from "@preact/signals";
import { generateElement, Generator } from "@uimix/codegen";
import { CodeAssets, CodeInstanceInfo, Target } from "../../types/data";
import { rpc } from "../rpc";
import { formatHTML, formatJS } from "../util/format";

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

  readonly $codeFormat = signal<"json" | "htmlInlineStyle">("json");

  get code():
    | {
        content: string;
        type: "json" | "html" | "jsx";
      }
    | undefined {
    if (!this.target) {
      return;
    }

    if (this.$codeFormat.value === "json") {
      return {
        content: formatJS(JSON.stringify(this.target?.elementIR)),
        type: "json",
      };
    }

    // TODO: other formats

    const elements = this.target?.elementIR ?? [];
    const code = elements
      .flatMap((elem) => {
        // remove positions from root elements
        elem.style.position = "relative";
        elem.style.x = { left: 0 };
        elem.style.y = { top: 0 };
        return generateElement(elem, "tailwind");
      })
      .join("");

    return { content: code, type: "jsx" };
  }

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
