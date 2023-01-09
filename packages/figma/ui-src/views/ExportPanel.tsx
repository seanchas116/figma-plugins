import { FunctionComponent } from "preact";
import { Button } from "../components/Button";

export const ExportPanel: FunctionComponent = () => {
  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <Button>Export whole document</Button>
      <pre className="bg-gray-900 text-white p-2 rounded text-[10px] leading-tight whitespace-pre-wrap">
        TODO
      </pre>
    </div>
  );
};
