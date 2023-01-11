import { GeneratedFile, Generator, GeneratorOptions } from "@uimix/codegen";
import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { Button } from "../components/Button";
import { Select } from "../components/Input";
import { SyntaxHighlight } from "../components/SyntaxHighlight";
import { rpc } from "../rpc";
import JSZip from "jszip";

function downloadZipFile(zip: string, fileName: string) {
  const link = document.createElement("a");
  link.href = `data:application/zip;base64,${zip}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function makeZip(codes: GeneratedFile[]): Promise<string> {
  const zip = new JSZip();

  for (const code of codes) {
    zip.file(code.filePath, code.content);
  }

  return zip.generateAsync({ type: "base64" });
}

export const ExportPanel: FunctionComponent = () => {
  const [style, setStyle] = useState<GeneratorOptions["style"]>("inline");
  const [codes, setCodes] = useState<GeneratedFile[]>([]);

  const onExport = async () => {
    const components = await rpc.remote.exportWholeDocument();

    console.info("Generating...");
    console.info(JSON.stringify(components));

    const generator = new Generator({ components, style });
    const codes = generator.generateProject();

    setCodes(codes);

    makeZip(codes).then((zip) => {
      downloadZipFile(zip, "export.zip");
    });
  };

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Button onClick={onExport}>Export whole document</Button>
        <Select
          value={style}
          onChange={(e) => {
            setStyle(e.currentTarget.value as GeneratorOptions["style"]);
          }}
        >
          <option value="tailwind">Tailwind</option>
          <option value="inline">Inline Style</option>
          <option value="css">CSS</option>
        </Select>
      </div>
      {codes.map((code) => (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">{code.filePath}</h3>
          <pre className="bg-gray-900 p-3 text-white rounded text-[10px] leading-tight whitespace-pre-wrap">
            <SyntaxHighlight
              content={code.content}
              type={code.filePath.endsWith(".js") ? "jsx" : "css"}
            />
          </pre>
        </div>
      ))}
    </div>
  );
};
