import { BrowserWindow } from "electron";
import { Store } from "../store";
import { ROOMS_JSONP_NAME, ROOMS_PATH, SWF_MIME_FILE } from "./constants";
import { parseAndUpdateLocation } from "./parsers/locationParser";
import { parseAndUpdateRooms } from "./parsers/roomParser";
import fetch from 'electron-fetch';

let debuggerSetup = false;

export const parseJSONP = (jsonp: string, name: string) => {
    const nameLength = name.length;

    const json = jsonp.slice(nameLength + 1, jsonp.length - 2);

    return JSON.parse(json);
};

export type RoomsResponse = {
    roomsJson: string,
    localizedJson?: string,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRoomsJsonFromParams = async (store: Store, mainWindow: BrowserWindow, params: any): Promise<RoomsResponse> => {
    let plainResponseBody;
    let localizedResponseBody;

    const url = params.response.url as string;

    const response = await mainWindow.webContents.debugger.sendCommand('Network.getResponseBody', {requestId: params.requestId});

    if (response.base64Encoded) {
        plainResponseBody = Buffer.from(response.body, 'base64').toString('utf8');
    } else {
        plainResponseBody = response.body;
    }

    /*
    URL is formatted like:
    https://media1.clubpenguin.com/play/en/web_service/game_configs/rooms.jsonp?v=1.3.64&callback=cp_rooms
    https://play.clubpenguin.com/en/web_service/game_configs/rooms.jsonp?v=1.3.63&callback=cp_rooms
    */

    if (!url.includes('/en/')) {
        localizedResponseBody = plainResponseBody;

        const webServiceIndex = url.indexOf('/web_service/');
        const urlStart = url.substring(0, webServiceIndex);
        const langIndex = urlStart.lastIndexOf('/');
        const lang = urlStart.substring(langIndex + 1);

        const enUrl = url.replace(lang, 'en');
        const enResponse = await fetch(enUrl);
        const enResponseBuffer = await enResponse.buffer();

        plainResponseBody = enResponseBuffer.toString();
    }

    let roomsJson = parseJSONP(plainResponseBody, ROOMS_JSONP_NAME);

    return {
        roomsJson: roomsJson,
        localizedJson: localizedResponseBody ? roomsJson : undefined,
    };
};

export const startRequestListener = (store: Store, mainWindow: BrowserWindow) => {
    // I don't like using the debugger for this purpose but I can't
    // think of any better way to do this.

    if (!mainWindow.webContents.debugger.isAttached())
    {
        try {
            mainWindow.webContents.debugger.attach('1.3');
        } catch (err) {
            console.log('Attach failed: ', err);
        }
    }

    if (!debuggerSetup)
    {
        mainWindow.webContents.debugger.on('detach', (_, reason) => {
            console.log('Detached due to: ', reason);
        });
    
        mainWindow.webContents.debugger.on('message', async (_, method, params) => {
            if (method === 'Network.responseReceived') {
                if (params.response.url.includes(ROOMS_PATH)) {
                    await parseAndUpdateRooms(store, mainWindow, params);
                }
        
                if (params.response.url.includes(SWF_MIME_FILE)) {
                    await parseAndUpdateLocation(store, params);
                }
            }
        });

        debuggerSetup = true;
    }
    
    mainWindow.webContents.debugger.sendCommand('Network.enable');
};
