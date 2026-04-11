import { type ReactNode } from 'react';

import { rootStore, StoreContext } from './storeContext';

export function StoreProvider({ children }: { children: ReactNode }) {
    return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
}
