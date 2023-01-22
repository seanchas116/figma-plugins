import {
  formatJS,
  GeneratedFile,
  ProjectGenerator,
  ProjectGeneratorOptions,
} from "@uimix/codegen";
import { Button } from "../components/Button";
import { Select } from "../components/Input";
import { SyntaxHighlight } from "../components/SyntaxHighlight";
import { rpc } from "../rpc";
import JSZip from "jszip";
import { useState } from "react";

const codesandboxIndexJS = formatJS(`import React from 'react';
import ReactDOM from 'react-dom';
import {Main} from './Main.js';

ReactDOM.render(
  <Main />,
  document.getElementById('root')
);`);

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

export const ExportPanel: React.FC = () => {
  const [style, setStyle] =
    useState<ProjectGeneratorOptions["style"]>("inline");
  const [codes, setCodes] = useState<GeneratedFile[]>([]);

  const onExport = async () => {
    const components = await rpc.remote.exportWholeDocument();

    console.info("Generating...");
    console.info(JSON.stringify(components));

    const generator = new ProjectGenerator({ components, style });
    const codes = generator.generate();

    setCodes(codes);
  };

  const onDownloadZip = async () => {
    const zip = await makeZip(codes);
    downloadZipFile(zip, "export.zip");
  };

  const onCodeSandbox = async () => {
    const req = await fetch(
      "https://codesandbox.io/api/v1/sandboxes/define?json=1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          files: {
            "package.json": {
              content: {
                dependencies: {
                  react: "latest",
                  "react-dom": "latest",
                },
              },
            },
            "index.html": {
              content: '<div id="root"></div>',
            },
            "index.js": {
              content: codesandboxIndexJS,
            },
            ...Object.fromEntries(
              codes.map((code) => [code.filePath, { content: code.content }])
            ),
          },
        }),
      }
    );
    const json = await req.json();
    const sandboxID = json.sandbox_id;

    window.open(`https://codesandbox.io/s/${sandboxID}`, "_blank");
  };

  return (
    <div className="px-4 py-3 flex flex-col gap-3 min-h-0 flex-1 overflow-scroll">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button onClick={onExport} className="mr-2">
            Export whole document
          </Button>
          <button className="px-2 hover:text-gray-500" onClick={onDownloadZip}>
            Download Zip
          </button>
          <button className="px-2 hover:text-gray-500" onClick={onCodeSandbox}>
            CodeSandbox
          </button>
        </div>
        <Select
          value={style}
          onChange={(e) => {
            setStyle(e.currentTarget.value as ProjectGeneratorOptions["style"]);
          }}
        >
          <option value="tailwind">Tailwind</option>
          <option value="inline">Inline Style</option>
          <option value="css">CSS</option>
          <option value="cssModules">CSS Modules</option>
        </Select>
      </div>
      {codes.map((code) => (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">{code.filePath}</h3>
          <pre className="bg-gray-900 p-3 text-white rounded text-[10px] leading-tight overflow-scroll">
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
