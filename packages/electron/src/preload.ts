import { ipcRenderer } from "electron";

window.addEventListener("message", ({ data }) => {
  ipcRenderer.send("postMessage", data);
});

ipcRenderer.on("postMessage", (event, data) => {
  window.postMessage(data, "*");
});
