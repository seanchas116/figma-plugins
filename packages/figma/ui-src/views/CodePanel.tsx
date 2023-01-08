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
      <pre className="bg-gray-900 text-white p-2 rounded text-[10px] leading-tight whitespace-pre-wrap">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
};
