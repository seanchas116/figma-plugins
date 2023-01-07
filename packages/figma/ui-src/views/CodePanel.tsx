import { FunctionComponent } from "preact";
import { Select } from "../components/Input";
import { state } from "../state/State";

export const CodePanel: FunctionComponent = () => {
  const code = state.code;

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
        {code}
      </pre>
    </div>
  );
};
