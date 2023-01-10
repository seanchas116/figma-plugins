import { Generator } from "@uimix/codegen";
import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { Button } from "../components/Button";
import { SyntaxHighlight } from "../components/SyntaxHighlight";
import { rpc } from "../rpc";
import { formatJS } from "../util/format";
import * as IR from "@uimix/element-ir";

export const ExportPanel: FunctionComponent = () => {
  const [code, setCode] = useState<string>("");

  const onExport = async () => {
    const components = await rpc.remote.exportWholeDocument();

    const componentMap: Record<string, IR.Component> = {};
    for (const component of components) {
      if (component.key) {
        componentMap[component.key] = component;
      }
    }

    const generator = new Generator({ jsx: true, components: componentMap });
    const code = generator.generateProject(components).join("");

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
