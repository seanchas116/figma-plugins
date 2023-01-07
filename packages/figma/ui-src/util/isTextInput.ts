const inputTypes = [
  "text",
  "password",
  "number",
  "email",
  "url",
  "search",
  "date",
  "datetime",
  "datetime-local",
  "time",
  "month",
  "week",
];

export function isTextInput(value: EventTarget | null | undefined): boolean {
  if (!value) return false;

  const elem = value as HTMLElement | SVGSVGElement;
  if ("contentEditable" in elem && elem.isContentEditable) {
    return true;
  }
  if (elem.tagName === "TEXTAREA") return true;
  if (elem.tagName === "INPUT") {
    return inputTypes.includes((elem as HTMLInputElement).type);
  }

  return false;
}
