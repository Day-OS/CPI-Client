import ElectronStore from 'electron-store';
import { BaseStore } from './store/BaseStore';
import { PublicSchema } from './store/PublicSchema';
import { PrivateSchema } from './store/PrivateSchema';
import { MemoryStore } from './store/MemoryStore';
import { FileStore } from './store/FileStore';

export const PLAY_URL = 'http://play.cpps.daytheipc.com';

export type Store = {
    public: BaseStore<PublicSchema>;
    private: BaseStore<PrivateSchema>;
}

export const defaultPublicValues: PublicSchema = {
    url: PLAY_URL,
    disableAds: false,
    enableDiscordRPC: true,
    enableDiscordRPCTracker: true,
    language: "pt",
};

const createPublicStore = () => {
    const publicStore = new ElectronStore<PublicSchema>({
        name: 'preferences',
        defaults: defaultPublicValues,
    });

    return new FileStore<PublicSchema>(publicStore);
};

const createPrivateStore = () => {
    const privateStore = new MemoryStore<PrivateSchema>();

    return privateStore;
};

const createStore = (): Store => {
    return {
        public: createPublicStore(),
        private: createPrivateStore(),
    };
};

export default createStore;