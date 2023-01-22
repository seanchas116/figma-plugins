import { rpc } from "../rpc";

let textToCopy: string | undefined;

document.addEventListener("copy", (event: ClipboardEvent) => {
  if (textToCopy === undefined) {
    return;
  }
  event.preventDefault();
  event.clipboardData?.setData("text/plain", textToCopy);
  textToCopy = undefined;

  void rpc.remote.notify("Copied to clipboard");
});

export function copyTextToClipboard(text: string) {
  textToCopy = text;
  document.execCommand("copy");
}
