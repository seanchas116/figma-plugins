// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import childProcess from "child_process";

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:5173");

  ipcMain.on("postMessage", (event, msg) => {
    console.log(msg);
  });

  setTimeout(() => {
    mainWindow.webContents.send("postMessage", {
      type: "iframe:render",
      width: 100,
      height: 100,
    });
  }, 1000);

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

const child = childProcess.fork(path.resolve(__dirname, "server.js"), [], {
  env: {
    ELECTRON_RUN_AS_NODE: "1",
  },
});

const cleanup = () => {
  const pids = [child.pid!];
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
