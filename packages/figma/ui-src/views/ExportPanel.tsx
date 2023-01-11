import { GeneratedFile, Generator } from "@uimix/codegen";
import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { Button } from "../components/Button";
import { SyntaxHighlight } from "../components/SyntaxHighlight";
import { rpc } from "../rpc";
import { formatJS } from "../util/format";

export const ExportPanel: FunctionComponent = () => {
  const [codes, setCodes] = useState<GeneratedFile[]>([]);

  const onExport = async () => {
    const components = await rpc.remote.exportWholeDocument();

    console.info("Generating...");
    console.info(JSON.stringify(components));

    const generator = new Generator({ jsx: true, components });
    const codes = generator.generateProject();

    setCodes(codes);
  };

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <Button onClick={onExport}>Export whole document</Button>
      {codes.map((code) => (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">{code.filePath}</h3>
          <pre className="bg-gray-900 p-3 text-white rounded text-[10px] leading-tight whitespace-pre-wrap">
            <SyntaxHighlight content={code.content} type="jsx" />
          </pre>
        </div>
      ))}
    </div>
  );
};
