import { FunctionComponent } from "preact";
import { Button } from "../components/Button";
import { CloseIcon } from "../components/Icon";
import { rpc } from "../rpc";
import { state } from "../state/State";

export const SettingsDialog: FunctionComponent = () => {
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
