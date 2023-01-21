let textToCopy: string | undefined;

document.addEventListener("copy", (event: ClipboardEvent) => {
  if (textToCopy === undefined) {
    return;
  }
  event.preventDefault();
  event.clipboardData?.setData("text/plain", textToCopy);
  textToCopy = undefined;
});

export function copyTextToClipboard(text: string) {
  textToCopy = text;
  document.execCommand("copy");
}
