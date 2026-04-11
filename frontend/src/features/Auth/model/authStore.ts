import type { RootStore } from '@app/model/rootStore';
import type { UserRole } from '@entities/User/model/types';
import { makeAutoObservable } from 'mobx';

export class AuthStore {
    isLoading = false;
    private root: RootStore;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
    }

    async login(email: string, _password: string, role: UserRole): Promise<void> {
        this.isLoading = true;
        await new Promise((resolve) => setTimeout(resolve, 800));
        this.root.user.setUser({
            id: 'user-1',
            name: email.split('@')[0],
            email,
            role,
        });
        this.isLoading = false;
    }

    async register(name: string, email: string, _password: string, role: UserRole): Promise<void> {
        this.isLoading = true;
        await new Promise((resolve) => setTimeout(resolve, 800));
        this.root.user.setUser({
            id: `user-${Date.now()}`,
            name,
            email,
            role,
        });
        this.isLoading = false;
    }

    logout(): void {
        this.root.user.clearUser();
    }
}
