import { observer } from "mobx-react-lite";
import { Button } from "../components/Button";
import { CloseIcon } from "../components/Icon";
import { rpc } from "../rpc";
import { state } from "../state/State";
import * as Dialog from "@radix-ui/react-dialog";

export const SettingsDialog: React.FC = observer(() => {
  const syncAssets = () => {
    rpc.remote.syncCodeAssets(state.assets);
  };

  return (
    <Dialog.Content className="fixed inset-2 rounded bg-white border border-gray-200 shadow p-3 text-[11px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold">Settings</h1>
          <Dialog.Close asChild>
            <button className="rounded p-1 -m-1 hover:bg-gray-100 aria-pressed:bg-blue-500 aria-pressed:text-white">
              <CloseIcon />
            </button>
          </Dialog.Close>
        </div>
        <Button onClick={syncAssets}>Sync Components & Tokens</Button>
      </div>
    </Dialog.Content>
  );
});
