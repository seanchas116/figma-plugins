import { Icon } from "@iconify/react";
import { Button } from "../components/Button";
import { rpc } from "../rpc";

export const InsertPanel: React.FC = () => {
  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 flex flex-col gap-3 border-b border-gray-200">
        <h1 className="font-semibold">Responsive</h1>
        <Button
          onClick={() => {
            rpc.remote.createResponsivePage();
          }}
        >
          <Icon icon="material-symbols:add" className="text-xs" />
          Create Responsive Page
        </Button>
      </div>
    </div>
  );
};
