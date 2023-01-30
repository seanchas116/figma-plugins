import { observer } from "mobx-react-lite";
import { rpc } from "../../rpc";
import { Button } from "../../components/Button";

export const SimpleResponsiveSection: React.FC = observer(() => {
  return (
    <div className="px-4 py-3 flex flex-col gap-3 border-b border-gray-200">
      <h2 className="font-semibold flex items-center justify-between">
        Responsive
      </h2>
      <Button
        onClick={() => {
          void rpc.remote.simpleResponsiveCreateComponent();
        }}
      >
        Create Responsive Component
      </Button>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            void rpc.remote.simpleResponsiveSync();
          }}
        >
          Sync
        </Button>
        <Button
          onClick={() => {
            void rpc.remote.copyStylesToSmallerScreens();
          }}
        >
          ←
        </Button>
        <Button
          onClick={() => {
            void rpc.remote.copyStylesToLargerScreens();
          }}
        >
          →
        </Button>
      </div>
    </div>
  );
});
