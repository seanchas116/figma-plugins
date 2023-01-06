import { FunctionComponent } from "preact";
import { InstanceEdit } from "./InstanceEdit";
import { CodeComponentIFrame } from "./CodeComponentIFrame";
import { Resizer } from "./Resizer";
import { state, tabs } from "../state/State";
import { CloseIcon, MenuIcon } from "../components/Icon";
import { useEffect } from "preact/hooks";
import { Tabs, TabItem } from "../components/Tabs";
import { Button } from "../components/Button";
import { rpc } from "../rpc";
import { Select } from "../components/Input";

const inputTypes = [
  "text",
  "password",
  "number",
  "email",
  "url",
  "search",
  "date",
  "datetime",
  "datetime-local",
  "time",
  "month",
  "week",
];

export function isTextInput(value: EventTarget | null | undefined): boolean {
  if (!value) return false;

  const elem = value as HTMLElement | SVGSVGElement;
  if ("contentEditable" in elem && elem.isContentEditable) {
    return true;
  }
  if (elem.tagName === "TEXTAREA") return true;
  if (elem.tagName === "INPUT") {
    return inputTypes.includes((elem as HTMLInputElement).type);
  }

  return false;
}

const AppTabs: FunctionComponent = () => {
  return (
    <Tabs>
      {tabs.map((tab) => (
        <TabItem
          aria-selected={tab.id === state.$selectedTab.value}
          onClick={() => {
            state.$selectedTab.value = tab.id;
          }}
        >
          {tab.label}
        </TabItem>
      ))}
      <div className="flex-1" />
      <button
        className="p-2 rounded hover:bg-gray-100 aria-pressed:bg-blue-500 aria-pressed:text-white"
        aria-pressed={state.$showsSettings.value}
        onClick={() => {
          state.$showsSettings.value = !state.$showsSettings.value;
        }}
      >
        <MenuIcon />
      </button>
    </Tabs>
  );
};

const SettingsDialog: FunctionComponent = () => {
  const syncAssets = () => {
    rpc.remote.syncCodeAssets(state.$assets.value);
  };

  return (
    <div
      className="fixed inset-2 rounded bg-white border border-gray-200 shadow p-3"
      hidden={!state.$showsSettings.value}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold">Settings</h1>
          <button
            className="rounded p-1 -m-1 hover:bg-gray-100 aria-pressed:bg-blue-500 aria-pressed:text-white"
            onClick={() => {
              state.$showsSettings.value = false;
            }}
          >
            <CloseIcon />
          </button>
        </div>
        <Button onClick={syncAssets}>Sync Components & Tokens</Button>
      </div>
    </div>
  );
};

const LayerTabContent: FunctionComponent = () => {
  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <InstanceEdit />
      <CodeComponentIFrame />
    </div>
  );
};

const CodeTabContent: FunctionComponent = () => {
  const code = JSON.stringify(state.$target.value?.elementIR ?? [], null, 2);

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <Select value="json" onChange={() => {}}>
        <option value="json">JSON</option>
        <option value="react-tailwind">React + Tailwind</option>
      </Select>
      <pre className="bg-gray-900 text-white p-2 rounded text-[10px] leading-tight">
        {code}
      </pre>
    </div>
  );
};

export const App: FunctionComponent = () => {
  useEffect(() => {
    const onWindowKeyPress = (event: KeyboardEvent) => {
      if (!isTextInput(event.target)) {
        // let Figma handle shortcuts
        event.preventDefault();
      }
    };
    window.addEventListener("keypress", onWindowKeyPress);
    return () => {
      window.removeEventListener("keypress", onWindowKeyPress);
    };
  }, []);

  return (
    <div className="text-[11px] leading-4 text-gray-900 accent-blue-500">
      <AppTabs />
      {state.$selectedTab.value === "layer" && <LayerTabContent />}
      {state.$selectedTab.value === "code" && <CodeTabContent />}
      <SettingsDialog />
      <Resizer />
    </div>
  );
};
