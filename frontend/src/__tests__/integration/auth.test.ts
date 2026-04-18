import { RootStore } from '@app/model/rootStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@shared/api/generated', () => ({
    login: vi.fn(),
    register: vi.fn(),
    getQuizzesByUser: vi.fn(),
    getQuiz: vi.fn(),
    createQuiz: vi.fn(),
    updateQuiz: vi.fn(),
    deleteQuiz: vi.fn(),
}));

import * as api from '@shared/api/generated';

const mockUser = (id: string, email: string, role: string) => ({
    data: { id, name: email.split('@')[0], email, role },
    status: 200,
    headers: new Headers(),
});

describe('AuthStore ↔ UserStore integration', () => {
    let root: RootStore;

    beforeEach(() => {
        root = new RootStore();
        vi.clearAllMocks();
    });

    describe('login', () => {
        it('sets currentUser after successful login', async () => {
            vi.mocked(api.login).mockResolvedValue(
                mockUser('u1', 'alice@example.com', 'participant') as never,
            );
            await root.auth.login('alice@example.com', 'pass');
            expect(root.user.currentUser?.email).toBe('alice@example.com');
        });

        it('sets isAuthenticated to true after login', async () => {
            vi.mocked(api.login).mockResolvedValue(
                mockUser('u1', 'alice@example.com', 'participant') as never,
            );
            expect(root.user.isAuthenticated).toBe(false);
            await root.auth.login('alice@example.com', 'pass');
            expect(root.user.isAuthenticated).toBe(true);
        });

        it('assigns organizer role when specified', async () => {
            vi.mocked(api.login).mockResolvedValue(
                mockUser('u2', 'host@example.com', 'organizer') as never,
            );
            await root.auth.login('alice@example.com', 'pass');
            expect(root.user.currentUser?.role).toBe('organizer');
        });

        it('assigns participant role when specified', async () => {
            vi.mocked(api.login).mockResolvedValue(
                mockUser('u1', 'alice@example.com', 'participant') as never,
            );
            await root.auth.login('alice@example.com', 'pass');
            expect(root.user.currentUser?.role).toBe('participant');
        });

        it('sets isLoading to true during login and false after', async () => {
            let loadingDuringCall = false;
            vi.mocked(api.login).mockImplementation(async () => {
                loadingDuringCall = root.auth.isLoading;
                return mockUser('u1', 'alice@example.com', 'participant') as never;
            });
            await root.auth.login('alice@example.com', 'pass');
            expect(loadingDuringCall).toBe(true);
            expect(root.auth.isLoading).toBe(false);
        });

        it('sets error on failure', async () => {
            vi.mocked(api.login).mockRejectedValue(new Error('Invalid credentials'));
            await expect(root.auth.login('bad@example.com', 'wrong')).rejects.toThrow();
            expect(root.auth.error).toBe('Invalid credentials');
        });
    });

    describe('register', () => {
        it('sets currentUser after registration', async () => {
            vi.mocked(api.register).mockResolvedValue(
                mockUser('u3', 'new@example.com', 'organizer') as never,
            );
            await root.auth.register('New', 'new@example.com', 'pass', 'organizer');
            expect(root.user.currentUser?.email).toBe('new@example.com');
        });

        it('sets isLoading to true during register and false after', async () => {
            let loadingDuringCall = false;
            vi.mocked(api.register).mockImplementation(async () => {
                loadingDuringCall = root.auth.isLoading;
                return mockUser('u3', 'new@example.com', 'organizer') as never;
            });
            await root.auth.register('New', 'new@example.com', 'pass', 'organizer');
            expect(loadingDuringCall).toBe(true);
            expect(root.auth.isLoading).toBe(false);
        });
    });

    describe('logout', () => {
        it('clears currentUser', async () => {
            vi.mocked(api.login).mockResolvedValue(
                mockUser('u1', 'alice@example.com', 'participant') as never,
            );
            await root.auth.login('alice@example.com', 'pass');
            root.auth.logout();
            expect(root.user.currentUser).toBeNull();
        });

        it('sets isAuthenticated to false', async () => {
            vi.mocked(api.login).mockResolvedValue(
                mockUser('u1', 'alice@example.com', 'participant') as never,
            );
            await root.auth.login('alice@example.com', 'pass');
            root.auth.logout();
            expect(root.user.isAuthenticated).toBe(false);
        });
    });
});
