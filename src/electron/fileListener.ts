const { ipcMain, dialog } = require("electron");
import { promisify } from "util";
import { readFile as _readFile, readdir as _readdir } from "fs";

const [readFileAsync, readdirAsync] = [_readFile, _readdir].map(promisify);

export default function({ APPDATA }) {
  ipcMain.on("readFile", event => {
    console.log("readFile", event);
    event.reply("readFile", "done");
  });

  ipcMain.on("selectFiles", async event => {
    const selector = await dialog.showOpenDialog({ properties: ["openFile", "multiSelections"] });
    if(selector.canceled) {
      event.reply("selectFiles", "ERROR:File Select Canceled");
      return;
    }
    event.reply("selectFiles", selector.filePaths);
  });
};
