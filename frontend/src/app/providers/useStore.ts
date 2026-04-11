import { RootStore } from '@app/model/rootStore';
import { useContext } from 'react';

import { StoreContext } from './storeContext';

export const useStore = (): RootStore => {
    return useContext(StoreContext);
};
