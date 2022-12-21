import { MessageToUI } from "../message";

export function postMessageToUI(msg: MessageToUI) {
  figma.ui.postMessage(msg);
}

export const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout | undefined;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = undefined;
    }, delay);
  };
};
