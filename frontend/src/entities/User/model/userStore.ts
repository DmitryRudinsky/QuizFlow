import { makeAutoObservable } from 'mobx';

import type { QuizHistory, User } from './types';

const MOCK_HISTORY: QuizHistory[] = [
    {
        id: 'h1',
        quizTitle: 'JavaScript Fundamentals',
        date: '2026-04-08',
        score: 850,
        totalQuestions: 15,
        rank: 2,
        totalParticipants: 42,
    },
    {
        id: 'h2',
        quizTitle: 'React Hooks Deep Dive',
        date: '2026-04-07',
        score: 1200,
        totalQuestions: 20,
        rank: 1,
        totalParticipants: 38,
    },
    {
        id: 'h3',
        quizTitle: 'CSS Grid & Flexbox',
        date: '2026-04-05',
        score: 600,
        totalQuestions: 12,
        rank: 5,
        totalParticipants: 29,
    },
];

export class UserStore {
    currentUser: User | null = null;
    quizHistory: QuizHistory[] = MOCK_HISTORY;

    constructor() {
        makeAutoObservable(this);
    }

    get isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    setUser(user: User): void {
        this.currentUser = user;
    }

    clearUser(): void {
        this.currentUser = null;
        this.quizHistory = [];
    }

    addHistoryEntry(entry: QuizHistory): void {
        this.quizHistory.unshift(entry);
    }
}
