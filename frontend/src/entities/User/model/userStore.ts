import { makeAutoObservable } from 'mobx';

import type { QuizHistory, User } from './types';

export class UserStore {
    currentUser: User | null = null;
    quizHistory: QuizHistory[] = [];

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
