import { FunctionComponent } from "preact";
import { postMessageToPlugin } from "../common";
import { InstanceEdit } from "./InstanceEdit";
import { RenderIFrame } from "./RenderIFrame";
import { Resizer } from "./Resizer";
import { state } from "../state/State";
import { styled } from "./styled";
import { CloseIcon, MenuIcon } from "./icons";
import { useEffect } from "preact/hooks";

const Tabs = styled(
  "div",
  `
   flex items-center px-2 relative
   before:content-[''] before:absolute
   before:left-0 before:right-0 before:bottom-0 before:h-[1px]
   before:bg-gray-200
  `
);
const TabItem = styled(
  "button",
  `
    font-medium text-gray-400 leading-10 px-2 relative
    hover:text-gray-600
    aria-selected:text-gray-900
    aria-selected:before:content-[''] aria-selected:before:absolute
    aria-selected:before:left-0 aria-selected:before:right-0 aria-selected:before:bottom-0 aria-selected:before:h-[2px]
    aria-selected:before:bg-blue-500
  `
);

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
      <div className="px-4 py-3 flex flex-col gap-2">
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
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
            onClick={syncAssets}
          >
            Sync Components & Tokens
          </button>
        </div>
      </div>
      <Resizer />
    </div>
  );
};
