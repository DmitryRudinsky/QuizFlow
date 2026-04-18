import type { RootStore } from '@app/model/rootStore';
import type { UserRole } from '@entities/User/model/types';
import { login, register } from '@shared/api/generated';
import { makeAutoObservable } from 'mobx';

export class AuthStore {
    isLoading = false;
    error: string | null = null;
    private root: RootStore;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
    }

    async login(email: string, password: string): Promise<void> {
        this.isLoading = true;
        this.error = null;
        try {
            const res = await login({ email, password });
            this.root.user.setUser({
                id: res.data.id,
                name: res.data.name,
                email: res.data.email,
                role: res.data.role,
            });
        } catch (e) {
            this.error = e instanceof Error ? e.message : 'Login failed';
            throw e;
        } finally {
            this.isLoading = false;
        }
    }

    async register(name: string, email: string, password: string, role: UserRole): Promise<void> {
        this.isLoading = true;
        this.error = null;
        try {
            const res = await register({ name, email, password, role });
            this.root.user.setUser({
                id: res.data.id,
                name: res.data.name,
                email: res.data.email,
                role: res.data.role,
            });
        } catch (e) {
            this.error = e instanceof Error ? e.message : 'Registration failed';
            throw e;
        } finally {
            this.isLoading = false;
        }
    }

    logout(): void {
        this.root.user.clearUser();
    }
}
