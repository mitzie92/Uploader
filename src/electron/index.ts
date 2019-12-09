const { app, BrowserWindow } = require("electron");
const { format } = require("url");
const { join } = require("path");
import loginListener from "./loginListener";
import fileListener from "./fileListener";

function createWindow () {
  // Create the browser window.
  let window = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  window.loadURL(
    format({
      pathname: join(__dirname, "../../dist/frontend/index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  loginListener();
  fileListener({
    APPDATA: app.getPath("userData")
  });
}

app.on("ready", createWindow);
