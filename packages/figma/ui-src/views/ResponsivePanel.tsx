import { FunctionComponent } from "preact";
import { state } from "../state/State";
import { Button } from "../components/Button";
import { rpc } from "../rpc";

export const ResponsivePanel: FunctionComponent = () => {
  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <Button
        onClick={() => {
          rpc.remote.createResponsivePage();
        }}
      >
        Create Responsive Page
      </Button>
    </div>
  );
};
