import type { RootStore } from '@app/model/rootStore';
import type { UserRole } from '@entities/User/model/types';
import { customFetch } from '@shared/api/client';
import { login, me as getMe, register } from '@shared/api/generated';
import { makeAutoObservable, runInAction } from 'mobx';

export class AuthStore {
    isLoading = false;
    error: string | null = null;
    private root: RootStore;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
        this.restoreSession();
    }

    async restoreSession(): Promise<void> {
        try {
            const res = await getMe();
            runInAction(() => {
                this.root.user.setUser({
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email,
                    role: res.data.role as UserRole,
                });
            });
        } catch {
            // нет сессии — остаёмся неаутентифицированными
        }
    }

    async login(email: string, password: string): Promise<void> {
        this.isLoading = true;
        this.error = null;
        try {
            const res = await login({ email, password });
            runInAction(() => {
                this.root.user.setUser({
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email,
                    role: res.data.role as UserRole,
                });
            });
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Login failed';
            });
            throw e;
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async register(name: string, email: string, password: string, role: UserRole): Promise<void> {
        this.isLoading = true;
        this.error = null;
        try {
            const res = await register({ name, email, password, role });
            runInAction(() => {
                this.root.user.setUser({
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email,
                    role: res.data.role as UserRole,
                });
            });
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Registration failed';
            });
            throw e;
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    logout(): void {
        customFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        this.root.user.clearUser();
    }
}
