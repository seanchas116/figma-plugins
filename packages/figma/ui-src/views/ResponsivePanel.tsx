import { FunctionComponent } from "preact";
import { state } from "../state/State";
import { Button } from "../components/Button";

export const ResponsivePanel: FunctionComponent = () => {
  const code = state.code;
  if (!code) {
    return null;
  }

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <Button>Make Frame 1 Responsive</Button>
    </div>
  );
};
