import { signal } from "@preact/signals";
import { generateHTMLWithInlineCSS } from "@uimix/codegen";
import { CodeAssets, CodeInstanceInfo, Target } from "../../types/data";
import { rpc } from "../rpc";
import { toHtml } from "hast-util-to-html";
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

  get code(): string {
    if (this.$codeFormat.value === "json") {
      return formatJS(JSON.stringify(this.target?.elementIR));
    }
    if (this.$codeFormat.value === "htmlInlineStyle") {
      const elements = this.target?.elementIR ?? [];
      const ast = elements.map((elem) => generateHTMLWithInlineCSS(elem));

      const html = toHtml({
        type: "root",
        children: ast,
      });
      return formatHTML(html);
    }
    return "";
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
