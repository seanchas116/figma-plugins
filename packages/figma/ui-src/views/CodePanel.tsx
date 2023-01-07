import { FunctionComponent } from "preact";
import { Select } from "../components/Input";
import { state } from "../state/State";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prism-themes/themes/prism-material-dark.css";

export const CodePanel: FunctionComponent = () => {
  const code = state.code;
  if (!code) {
    return null;
  }

  let html = "";
  try {
    html = Prism.highlight(code.content, Prism.languages[code.type], code.type);
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <Select
        value={state.$codeFormat.value}
        onChange={(e) => {
          state.$codeFormat.value = e.currentTarget.value as any;
        }}
      >
        <option value="json">JSON</option>
        <option value="htmlInlineStyle">HTML + Inline Style</option>
      </Select>
      <pre className="bg-gray-900 text-white p-2 rounded text-[10px] leading-tight whitespace-pre-wrap">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
};
