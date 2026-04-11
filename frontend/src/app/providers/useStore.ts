import { RootStore } from '@app/model/rootStore';
import { useContext } from 'react';

import { StoreContext } from './storeContext';

export function useStore(): RootStore {
    return useContext(StoreContext);
}
