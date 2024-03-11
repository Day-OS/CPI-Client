import { DiscordState } from "./DiscordState";
import i18n from "../localization/i18n";
import { adblocker } from "../adblocker/adblocker_imports";

export type PrivateSchema = {
    blocker?: typeof adblocker.ElectronBlocker;
    discordState?: DiscordState;
    fullScreen: boolean;
    localizer: i18n;
}

