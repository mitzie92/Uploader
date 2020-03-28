const { ipcMain, BrowserWindow } = require("electron");

export default () => {
  ipcMain.on("login", event => {
    let authWindow = new BrowserWindow({
      width: 350,
      height: 460,
      webPreferences: {
        nodeIntegration: false,
        enableRemoteModule: false
      }
    });

    const authUrl = `https://api.modwat.ch/oauth/authorize?client_id=uploader&redirect_uri=https%3A%2F%2Fmodwat.ch%2F&response_type=code`

    function handleNavigation (url: string) {
      if(url.includes("/access_token/")) {
        const [,token] = /.+access_token\/(.+)\/token_type.+/.exec(url);
        event.reply("login", token);
        authWindow.removeAllListeners("closed");
        authWindow.destroy();
      }
    }

    authWindow.on("closed", () => {
      event.reply("login", "ERROR:Auth window was closed by user");
    });

    authWindow.webContents.on('will-redirect', (event, url) => {
      handleNavigation(url)
    });

    authWindow.loadURL(authUrl);
  });
};