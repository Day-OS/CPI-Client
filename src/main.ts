import { app, BrowserWindow } from "electron";
import log from "electron-log/main";
import { autoUpdater } from "electron-updater";
import { startDiscordRPC } from "./discord";
import loadFlashPlugin from "./flash-loader";
import i18n from "./localization/i18n";
import startMenu from "./menu";
import createStore from "./store";
import createWindow from "./window";

// Overrides console.log with the Electron logger.
log.initialize();
console.log = log.log;

// The data store for permanent and temporary data
const store = createStore();

// This is our global object to localize text.
store.private.set('localizer', new i18n());

if (process.platform === 'linux') {
    app.commandLine.appendSwitch('no-sandbox');
}

loadFlashPlugin(app);

autoUpdater.checkForUpdatesAndNotify();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow;

app.on('ready', async () => {
    // Choose the best language before starting everything up.
    await store.private.get('localizer').chooseBestLanguage(store, app);

    mainWindow = await createWindow(store);

    // Some users were reporting problems with the cache.
    await mainWindow.webContents.session.clearHostResolverCache();

    startMenu(store, mainWindow);

    startDiscordRPC(store, mainWindow);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

app.on('window-all-closed', async () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q.
    if (process.platform !== 'darwin') {
        try {
            const discordClient = store.private.get('discordState')?.client;

            if (discordClient) {
                await discordClient.destroy();
            }
        }
        finally {
            // Always try to quit.
            app.quit();

            process.exit(0);
        }
    }
});

app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        mainWindow = await createWindow(store);
    }
});