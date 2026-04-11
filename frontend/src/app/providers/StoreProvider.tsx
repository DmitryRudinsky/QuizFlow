import { RootStore } from '@app/model/rootStore';
import { createContext, type ReactNode, useContext } from 'react';

const rootStore = new RootStore();
const StoreContext = createContext<RootStore>(rootStore);

export function StoreProvider({ children }: { children: ReactNode }) {
    return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
}

export function useStore(): RootStore {
    return useContext(StoreContext);
}
