import { Client } from "discord-rpc";

export type DiscordState = {
    currentLocation?: CPLocation,
    trackedLocations?: CPLocation[],
    client?: Client,
    gameName?: string,
    startTimestamp?: Date,
    windowReloadRegistered?: boolean,
}

export type CPLocation = {
    room_id: number,
    name: string,
    room_key?: string,
    room_type: CPLocationType,
    match: string,
}

export enum CPLocationType {
    Room = 0,
    Game = 1,
}