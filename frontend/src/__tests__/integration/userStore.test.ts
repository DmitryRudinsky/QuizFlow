import type { QuizHistory, User } from '@entities/User/model/types';
import { UserStore } from '@entities/User/model/userStore';
import { beforeEach, describe, expect, it } from 'vitest';

const MOCK_USER: User = {
    id: 'u1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'participant',
};

const MOCK_HISTORY_ENTRY: QuizHistory = {
    id: 'h10',
    quizTitle: 'Test Quiz',
    date: '2026-04-11',
    score: 900,
    totalQuestions: 10,
    rank: 1,
    totalParticipants: 20,
};

describe('UserStore', () => {
    let store: UserStore;

    beforeEach(() => {
        store = new UserStore();
    });

    describe('initial state', () => {
        it('currentUser is null initially', () => {
            expect(store.currentUser).toBeNull();
        });

        it('isAuthenticated is false initially', () => {
            expect(store.isAuthenticated).toBe(false);
        });

        it('quizHistory starts with mock data', () => {
            expect(store.quizHistory.length).toBeGreaterThan(0);
        });
    });

    describe('setUser', () => {
        it('sets currentUser', () => {
            store.setUser(MOCK_USER);
            expect(store.currentUser).toEqual(MOCK_USER);
        });

        it('isAuthenticated becomes true after setUser', () => {
            store.setUser(MOCK_USER);
            expect(store.isAuthenticated).toBe(true);
        });
    });

    describe('clearUser', () => {
        it('sets currentUser to null', () => {
            store.setUser(MOCK_USER);
            store.clearUser();
            expect(store.currentUser).toBeNull();
        });

        it('empties quizHistory', () => {
            store.setUser(MOCK_USER);
            store.clearUser();
            expect(store.quizHistory).toHaveLength(0);
        });

        it('isAuthenticated becomes false', () => {
            store.setUser(MOCK_USER);
            store.clearUser();
            expect(store.isAuthenticated).toBe(false);
        });
    });

    describe('addHistoryEntry', () => {
        it('prepends entry to quizHistory', () => {
            const initialLength = store.quizHistory.length;
            store.addHistoryEntry(MOCK_HISTORY_ENTRY);
            expect(store.quizHistory).toHaveLength(initialLength + 1);
            expect(store.quizHistory[0]).toEqual(MOCK_HISTORY_ENTRY);
        });

        it('multiple entries are prepended in reverse order', () => {
            const entry1: QuizHistory = { ...MOCK_HISTORY_ENTRY, id: 'e1', quizTitle: 'First' };
            const entry2: QuizHistory = { ...MOCK_HISTORY_ENTRY, id: 'e2', quizTitle: 'Second' };
            store.addHistoryEntry(entry1);
            store.addHistoryEntry(entry2);
            expect(store.quizHistory[0].quizTitle).toBe('Second');
            expect(store.quizHistory[1].quizTitle).toBe('First');
        });
    });
});
