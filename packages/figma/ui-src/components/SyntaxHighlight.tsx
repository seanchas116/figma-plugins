import { FunctionComponent } from "preact";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prism-themes/themes/prism-material-dark.css";

export const SyntaxHighlight: FunctionComponent<{
  content: string;
  type: string;
}> = ({ content, type }) => {
  let html = "";
  try {
    html = Prism.highlight(content, Prism.languages[type], type);
  } catch (e) {
    console.error(e);
    html = content;
  }

  return <code dangerouslySetInnerHTML={{ __html: html }} />;
};
