import { FunctionComponent } from "preact";
import { postMessageToPlugin } from "../common";
import { InstanceEdit } from "./InstanceEdit";
import { RenderIFrame } from "./RenderIFrame";
import { Resizer } from "./Resizer";
import { state } from "../state/State";
import { CloseIcon, MenuIcon } from "../components/Icon";
import { useEffect } from "preact/hooks";
import { Tabs, TabItem } from "../components/Tabs";
import { Button } from "../components/Button";

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

export const App: FunctionComponent = () => {
  const syncAssets = () => {
    postMessageToPlugin({
      type: "syncAssets",
      payload: {
        assets: state.$assets.value,
      },
    });
  };

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
      <Tabs>
        <TabItem>Insert</TabItem>
        <TabItem aria-selected>Layer</TabItem>
        <TabItem>Code</TabItem>
        <TabItem>Export</TabItem>
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
      <div className="px-4 py-3 flex flex-col gap-3">
        <InstanceEdit />
        <RenderIFrame />
      </div>
      <div
        className="fixed inset-2 rounded bg-white border border-gray-200 shadow p-3"
        hidden={!state.$showsSettings.value}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="font-bold">Settings</h1>
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
      <Resizer />
    </div>
  );
};
