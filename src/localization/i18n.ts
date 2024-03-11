// Based on: https://www.christianengvall.se/electron-localization/

import { join } from 'path';
import { promises } from 'fs';
import { App } from "electron";
import { Store } from "../store";

let loadedLanguage: Map<string, string>;

export const supportedLanguages = [
	'en',
	'pt'
]

export let autoSelectLanguages = true;

class i18n {
	__ = function(identifier: string) {
		let translation = loadedLanguage.get(identifier);
		if(translation === undefined) {
			translation = identifier;
		}
		return translation;
	}
	
	__buttons = function(acknowledge: boolean = false) {
		if (acknowledge) {
			return [this.__('PROMPT_OK')];
		} else {
			return [this.__('PROMPT_YES'), this.__('PROMPT_NO')];
		}
	}

	__toggle = function(flag: boolean, lowercase: boolean = false) {
		let toggleText;

		if (flag) {
			toggleText = this.__('ENABLE');
		} else {
			toggleText = this.__('DISABLE');
		}

		if (lowercase) {
			toggleText = toggleText.toLowerCase();
		}
		return toggleText;
	}

	loadLanguage = async function (store: Store, language: string) {
		try {
			const langData = await promises.readFile(join(__dirname, language + '.json'), {encoding: 'utf8'});
	
			const langDataObj = JSON.parse(langData);
	
			loadedLanguage = new Map(Object.entries(langDataObj));

			store.public.set('language', language);
	
			return true;
		} catch (err) {
			return false;
		}
	}

	chooseLanguage = async function (store: Store, language: string) {
		let langExists = false;

		for (let i = 0; i < supportedLanguages.length; i++) {
			if (supportedLanguages[i] == language) {
				await this.loadLanguage(store, language);
				langExists = true;
				break;
			}

			if (!langExists) {
				// Default to 'en' (US English).
				await this.loadLanguage(store, 'en');
			}
		}
	}

	chooseBestLanguage = async function (store: Store, app: App) {
		let preferredSystemLanguages: string[];

		const appEntries = Object.entries(app);

		for (let i = 0; i < appEntries.length; i++) {
			const entry = appEntries[i];

			if (entry[0] === 'getPreferredSystemLanguages') {
				// Go through every preferred language from the system settings.
				preferredSystemLanguages = entry[1]();
				break;
			}
		}

		if (preferredSystemLanguages == undefined) {
			// Fallback for older versions of Electron.
			autoSelectLanguages = false;
			await this.chooseLanguage(store, store.public.get('language'));
		} else {
			let langExists = false;

			for (let i = 0; i < preferredSystemLanguages.length; i++) {
				const preferredLanguage = preferredSystemLanguages[i];
		
				// Split for cases like 'en-us' where we might only have 'en' defined.
				const preferredLanguages = preferredLanguage.split('-');
				
				// Put the preferred language itself at the front so it's checked first.
				preferredLanguages.unshift(preferredLanguage);
		
				for (let i = 0; i < preferredLanguages.length; i++) {
					langExists = await this.loadLanguage(store, preferredLanguages[i].toLowerCase());
					if (langExists) {
						// Found one!
						break;
					}
				}
		
				if (langExists) {
					// Break out here too.
					break;
				}
			}
		
			// Default to 'en' (US English) if no language file is found.
			if (!langExists) {
				await this.loadLanguage(store, 'en');
			}
		}
	}
}

export default i18n;