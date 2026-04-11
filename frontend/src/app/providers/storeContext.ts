import { RootStore } from '@app/model/rootStore';
import { createContext } from 'react';

export const rootStore = new RootStore();
export const StoreContext = createContext<RootStore>(rootStore);
