import { LayerPanel } from "./LayerPanel";
import { CodeComponentIFrame } from "./CodeComponentIFrame";
import { Resizer } from "./Resizer";
import { state, tabs } from "../state/State";
import { MenuIcon } from "../components/Icon";
import { Tabs, TabItem } from "../components/Tabs";
import { CodePanel } from "./CodePanel";
import { SettingsDialog } from "./SettingsDialog";
import { isTextInput } from "../util/isTextInput";
import { ExportPanel } from "./ExportPanel";
import { ResponsivePanel } from "./ResponsivePanel";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { TooltipProvider } from "../components/Tooltip";
import { InsertPanel } from "./InsertPanel";

const AppTabs: React.FC = observer(() => {
  return (
    <Tabs>
      {tabs.map((tab) => (
        <TabItem
          aria-selected={tab.id === state.selectedTab}
          onClick={() => {
            state.selectedTab = tab.id;
          }}
        >
          {tab.label}
        </TabItem>
      ))}
      <div className="flex-1" />
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button className="p-2 rounded hover:bg-gray-100 aria-pressed:bg-blue-500 aria-pressed:text-white">
            <MenuIcon />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <SettingsDialog />
        </Dialog.Portal>
      </Dialog.Root>
    </Tabs>
  );
});

export const App: React.FC = observer(() => {
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
    <TooltipProvider>
      <div className="text-[11px] leading-4 text-gray-900 accent-blue-500">
        <AppTabs />
        {state.selectedTab === "insert" && <InsertPanel />}
        {state.selectedTab === "layer" && <LayerPanel />}
        {state.selectedTab === "code" && <CodePanel />}
        {state.selectedTab === "export" && <ExportPanel />}
        <CodeComponentIFrame />
        <Resizer />
      </div>
    </TooltipProvider>
  );
});
