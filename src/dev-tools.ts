import { BrowserWindow, dialog } from "electron";
import { Store } from "./store";

const toggleDevTools = async (store: Store, mainWindow: BrowserWindow) => {
    if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
        return;
    }

    const localizer = store.private.get('localizer');

    const confirmationResult = await dialog.showMessageBox(mainWindow, {
        buttons: localizer.__buttons(),
        title: localizer.__('PROMPT_DEV_TOOLS_TITLE'),
        message: localizer.__('PROMPT_DEV_TOOLS_MSG'),
    });

    if (confirmationResult.response !== 0) {
        return;
    }

    mainWindow.webContents.openDevTools();
};

export default toggleDevTools;