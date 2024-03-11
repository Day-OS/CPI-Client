import { BrowserWindow, dialog, App } from "electron";
import { Store } from './store';

export const showReloadDialog = async (store: Store, mainWindow: BrowserWindow, reloadNow: boolean = true) => {
    const localizer = store.private.get('localizer');

    const reloadResult = await dialog.showMessageBox(mainWindow, {
        buttons: localizer.__buttons(),
        title: localizer.__('PROMPT_RELOAD_TITLE'),
        message: localizer.__('PROMPT_RELOAD_MSG'),
    });

    if (reloadResult.response === 0 && reloadNow) {
        mainWindow.reload();
    }

    return reloadResult.response === 0;
};

export const showRestartDialog = async (store: Store, app: App, mainWindow: BrowserWindow, restartNow: boolean = true) => {
    const localizer = store.private.get('localizer');

    const restartResult = await dialog.showMessageBox(mainWindow, {
        buttons: localizer.__buttons(),
        title: localizer.__('PROMPT_RESTART_TITLE'),
        message: localizer.__('PROMPT_RESTART_MSG'),
    });

    if (restartResult.response === 0 && restartNow) {
        app.quit();
    }

    return restartResult.response === 0;
};