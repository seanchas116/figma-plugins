// Modules to control application life and create native browser window
import { app, BrowserWindow, clipboard, ipcMain } from "electron";
import path from "path";
import childProcess from "child_process";
import type { MessageFromServer, MessageToServer } from "./server";
// @ts-ignore
import type { MessageFromApp } from "../../app/src/message";

let _mainWindow: BrowserWindow | undefined;
let _serverProcess: childProcess.ChildProcess | undefined;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  _mainWindow = mainWindow;

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:5173");

  ipcMain.on("postMessage", async (event, msg) => {
    if (msg.type === "electron:renderEnd") {
      const message = msg as MessageFromApp;
      const image = await mainWindow.webContents.capturePage({
        x: message.payload.x,
        y: message.payload.y,
        width: message.payload.width,
        height: message.payload.height,
      });
      const dataURL = await image.toDataURL();
      const messageToServer: MessageToServer = {
        type: "captureEnd",
        requestID: message.requestID,
        payload: {
          width: message.payload.width,
          height: message.payload.height,
          dataURL,
        },
      };
      _serverProcess?.send?.(messageToServer);
    }
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const serverProcess = childProcess.fork(
  path.resolve(__dirname, "server.js"),
  [],
  {
    env: {
      ELECTRON_RUN_AS_NODE: "1",
    },
  }
);
_serverProcess = serverProcess;

const cleanup = () => {
  const pids = [serverProcess.pid!];
  console.log(pids);
  for (const pid of pids) {
    try {
      process.kill(pid);
    } catch (e) {
      console.error(e);
    }
  }
};

const quitEvents = [
  "SIGINT",
  "SIGHUP",
  "SIGQUIT",
  "SIGTERM",
  "uncaughtException",
  "exit",
];
for (const event of quitEvents) {
  process.on(event, cleanup);
}

serverProcess.on("message", (msg: MessageFromServer) => {
  console.log(msg);
  switch (msg.type) {
    case "capture": {
      _mainWindow?.webContents.send("postMessage", {
        type: "electron:render",
        requestID: msg.requestID,
        payload: {
          width: 100,
          height: 100,
        },
      });
      break;
    }
  }
});
