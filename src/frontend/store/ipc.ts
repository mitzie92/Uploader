const { ipcRenderer } = require("electron");
import { Game } from "@modwatch/types";

type SelectFileProps = {
  game: Game;
  filename: string;
}

export async function getToken(): Promise<string> {
  return ipcBuilder<string>("login");
}

export async function selectFiles({ game, filename }: SelectFileProps): Promise<string | Array<string>> {
  return ipcBuilder<Array<string>>("selectFiles", { game, filename });
}

export async function readFile(path): Promise<any> {
  return ipcBuilder("readFile", path);
}

export async function ipcBuilder<T = any>(name: string, ...args): Promise<T | string> {
  return new Promise((resolve, reject) => {
    ipcRenderer.send(name, args);
    ipcRenderer.once(name, (event, response: T | string) => {
      if(typeof response !== "string" || response.indexOf("ERROR:") !== 0) {
        resolve(response);
      } else {
        reject(response.slice(6));
      }
    });
  });
}
