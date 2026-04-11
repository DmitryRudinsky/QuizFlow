import { RootStore } from '@app/model/rootStore';
import { beforeEach, describe, expect, it } from 'vitest';

describe('AuthStore ↔ UserStore integration', () => {
    let root: RootStore;

    beforeEach(() => {
        root = new RootStore();
    });

    describe('login', () => {
        it('sets currentUser after successful login', async () => {
            await root.auth.login('alice@example.com', 'pass', 'participant');
            expect(root.user.currentUser).not.toBeNull();
            expect(root.user.currentUser?.email).toBe('alice@example.com');
        });

        it('sets isAuthenticated to true after login', async () => {
            expect(root.user.isAuthenticated).toBe(false);
            await root.auth.login('alice@example.com', 'pass', 'participant');
            expect(root.user.isAuthenticated).toBe(true);
        });

        it('assigns organizer role when specified', async () => {
            await root.auth.login('host@example.com', 'pass', 'organizer');
            expect(root.user.currentUser?.role).toBe('organizer');
        });

        it('assigns participant role when specified', async () => {
            await root.auth.login('alice@example.com', 'pass', 'participant');
            expect(root.user.currentUser?.role).toBe('participant');
        });

        it('sets isLoading to true during login and false after', async () => {
            const promise = root.auth.login('alice@example.com', 'pass', 'participant');
            expect(root.auth.isLoading).toBe(true);
            await promise;
            expect(root.auth.isLoading).toBe(false);
        });

        it('derives username from email', async () => {
            await root.auth.login('alice@example.com', 'pass', 'participant');
            expect(root.user.currentUser?.name).toBe('alice');
        });
    });

    describe('register', () => {
        it('sets currentUser after registration', async () => {
            await root.auth.register('Bob', 'bob@example.com', 'pass', 'organizer');
            expect(root.user.currentUser).not.toBeNull();
            expect(root.user.currentUser?.name).toBe('Bob');
            expect(root.user.currentUser?.email).toBe('bob@example.com');
        });

        it('sets isLoading to true during register and false after', async () => {
            const promise = root.auth.register('Bob', 'bob@example.com', 'pass', 'organizer');
            expect(root.auth.isLoading).toBe(true);
            await promise;
            expect(root.auth.isLoading).toBe(false);
        });
    });

    describe('logout', () => {
        it('clears currentUser', async () => {
            await root.auth.login('alice@example.com', 'pass', 'participant');
            root.auth.logout();
            expect(root.user.currentUser).toBeNull();
        });

        it('sets isAuthenticated to false', async () => {
            await root.auth.login('alice@example.com', 'pass', 'participant');
            root.auth.logout();
            expect(root.user.isAuthenticated).toBe(false);
        });

        it('clears quiz history', async () => {
            await root.auth.login('alice@example.com', 'pass', 'participant');
            root.auth.logout();
            expect(root.user.quizHistory).toHaveLength(0);
        });
    });
});
