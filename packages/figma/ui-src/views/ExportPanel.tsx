import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { Button } from "../components/Button";
import { rpc } from "../rpc";
import { formatJS } from "../util/format";

export const ExportPanel: FunctionComponent = () => {
  const [json, setJSON] = useState<any>(null);

  const onExport = async () => {
    const result = await rpc.remote.exportWholeDocument();
    setJSON(result);
  };

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <Button onClick={onExport}>Export whole document</Button>
      <pre className="bg-gray-900 text-white p-2 rounded text-[10px] leading-tight whitespace-pre-wrap">
        {formatJS(JSON.stringify(json))}
      </pre>
    </div>
  );
};
