import { Generator } from "@uimix/codegen";
import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { Button } from "../components/Button";
import { SyntaxHighlight } from "../components/SyntaxHighlight";
import { rpc } from "../rpc";
import { formatJS } from "../util/format";

export const ExportPanel: FunctionComponent = () => {
  const [code, setCode] = useState<string>("");

  const onExport = async () => {
    const result = await rpc.remote.exportWholeDocument();

    const generator = new Generator({ jsx: true });
    const code = result.flatMap((c) => generator.generateComponent(c)).join("");

    setCode(formatJS(code));
  };

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <Button onClick={onExport}>Export whole document</Button>
      <pre className="bg-gray-900 text-white p-2 rounded text-[10px] leading-tight whitespace-pre-wrap">
        <SyntaxHighlight content={code} type="jsx" />
      </pre>
    </div>
  );
};
