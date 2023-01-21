import { Select } from "../components/Input";
import { state } from "../state/State";
import { SyntaxHighlight } from "../components/SyntaxHighlight";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { ExportPanel } from "./ExportPanel";
import { copyTextToClipboard } from "../util/copyTextToClipboard";
import { Button } from "../components/Button";

export const CodePanel: React.FC = observer(() => {
  const code = state.code;
  if (!code) {
    return <ExportPanel />;
  }

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Select
          value={state.codeFormat}
          onChange={action((e) => {
            state.codeFormat = e.currentTarget.value as any;
          })}
        >
          <option value="json">JSON</option>
          <optgroup label="HTML">
            <option value="htmlInlineStyle">HTML + Inline Style</option>
            <option value="htmlTailwind">HTML + Tailwind</option>
          </optgroup>
          <optgroup label="JSX">
            <option value="jsxInlineStyle">JSX + Inline Style</option>
            <option value="jsxEmotion">JSX + Emotion</option>
            <option value="jsxTailwind">JSX + Tailwind</option>
          </optgroup>
          <optgroup label="SVG">
            <option value="svg">SVG</option>
            <option value="svgCurrentColor">SVG with currentColor</option>
          </optgroup>
          <option value="svg">React Native</option>
          <option value="svg">Flutter</option>
          <option value="svg">SwiftUI</option>
        </Select>
        <Button
          onClick={() => {
            copyTextToClipboard(code.content);
          }}
        >
          Copy
        </Button>
      </div>
      <pre className="bg-gray-900 text-white p-2 rounded text-[10px] leading-tight whitespace-pre-wrap">
        <SyntaxHighlight content={code.content} type={code.type} />
      </pre>
    </div>
  );
});
