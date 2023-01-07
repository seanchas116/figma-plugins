import { FunctionComponent } from "preact";
import { LayerTabContent } from "./LayerTabContent";
import { CodeComponentIFrame } from "./CodeComponentIFrame";
import { Resizer } from "./Resizer";
import { state, tabs } from "../state/State";
import { MenuIcon } from "../components/Icon";
import { useEffect } from "preact/hooks";
import { Tabs, TabItem } from "../components/Tabs";
import { CodeTabContent } from "./CodeTabContent";
import { SettingsDialog } from "./SettingsDialog";
import { isTextInput } from "../util/isTextInput";

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
      <CodeComponentIFrame />
      <SettingsDialog />
      <Resizer />
    </div>
  );
};
