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

const MOCK_QUIZZES: Quiz[] = [
    {
        id: '1',
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of JavaScript core concepts',
        category: 'programming',
        questions: [],
        settings: {
            timePerQuestion: 30,
            scoringMode: 'standard',
            allowAnswerChanges: false,
            randomizeQuestions: false,
            showCorrectAnswers: 'after-each',
        },
        createdBy: 'organizer-1',
        createdAt: '2026-04-08T10:00:00Z',
    },
    {
        id: '2',
        title: 'React Hooks Deep Dive',
        description: 'Advanced React hooks patterns',
        category: 'programming',
        questions: [],
        settings: {
            timePerQuestion: 45,
            scoringMode: 'time-bonus',
            allowAnswerChanges: false,
            randomizeQuestions: true,
            showCorrectAnswers: 'end-only',
        },
        createdBy: 'organizer-1',
        createdAt: '2026-04-07T14:00:00Z',
    },
    {
        id: '3',
        title: 'CSS Grid & Flexbox',
        description: 'Master modern CSS layouts',
        category: 'programming',
        questions: [],
        settings: {
            timePerQuestion: 30,
            scoringMode: 'standard',
            allowAnswerChanges: true,
            randomizeQuestions: false,
            showCorrectAnswers: 'after-each',
        },
        createdBy: 'organizer-1',
        createdAt: '2026-04-05T09:00:00Z',
    },
    {
        id: '4',
        title: 'TypeScript Basics',
        description: 'Type-safe JavaScript development',
        category: 'programming',
        questions: [],
        settings: {
            timePerQuestion: 40,
            scoringMode: 'streak',
            allowAnswerChanges: false,
            randomizeQuestions: true,
            showCorrectAnswers: 'end-only',
        },
        createdBy: 'organizer-1',
        createdAt: '2026-04-03T11:00:00Z',
    },
];

export class QuizStore {
    quizList: Quiz[] = MOCK_QUIZZES;
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
