import { getQuizzesByUser } from '@shared/api/generated';
import { makeAutoObservable, runInAction } from 'mobx';

import type { Quiz } from './types';

const DEFAULT_SETTINGS: Quiz['settings'] = {
    timePerQuestion: 30,
    scoringMode: 'standard',
    allowAnswerChanges: false,
    randomizeQuestions: false,
    showCorrectAnswers: 'after-each',
};

export class QuizStore {
    quizList: Quiz[] = [];
    isLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    get totalQuizzes(): number {
        return this.quizList.length;
    }

    async fetchByUser(): Promise<void> {
        this.isLoading = true;
        try {
            const res = await getQuizzesByUser();
            runInAction(() => {
                this.quizList = res.data.map((q) => ({
                    id: q.id,
                    title: q.title,
                    description: q.description ?? '',
                    category: q.category ?? '',
                    questions: [],
                    questionCount: q.questionCount,
                    settings: { ...DEFAULT_SETTINGS },
                    createdBy: q.createdBy,
                    createdAt: q.createdAt,
                }));
            });
        } catch {
            // keep existing list on error
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    addQuiz(quiz: Quiz): void {
        this.quizList.unshift(quiz);
    }

    updateQuiz(id: string, updates: Partial<Quiz>): void {
        const index = this.quizList.findIndex((q) => q.id === id);
        if (index !== -1) {
            this.quizList[index] = { ...this.quizList[index], ...updates };
        }
    }

    deleteQuiz(id: string): void {
        this.quizList = this.quizList.filter((q) => q.id !== id);
    }

    getById(id: string): Quiz | undefined {
        return this.quizList.find((q) => q.id === id);
    }
}
