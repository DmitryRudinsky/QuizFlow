import { deleteQuiz as deleteQuizApi, getQuiz, getQuizzesByUser } from '@shared/api/generated';
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

    async fetchById(id: string): Promise<void> {
        try {
            const res = await getQuiz(id);
            const q = res.data;
            const mapped: Quiz = {
                id: q.id,
                title: q.title,
                description: q.description ?? '',
                category: q.category ?? '',
                questions: q.questions.map((question) => ({
                    id: question.id,
                    type: question.type,
                    questionText: question.questionText,
                    answerType: question.answerType,
                    answers: question.answers.map((a) => ({
                        id: a.id,
                        text: a.text,
                        isCorrect: false,
                    })),
                    timeLimit: question.timeLimit,
                    points: question.points,
                })),
                settings: { ...DEFAULT_SETTINGS },
                createdBy: q.createdBy,
                createdAt: q.createdAt,
            };
            runInAction(() => {
                const index = this.quizList.findIndex((item) => item.id === id);
                if (index !== -1) {
                    this.quizList[index] = mapped;
                } else {
                    this.quizList.push(mapped);
                }
            });
        } catch {
            console.error('Failed to fetch');
        }
    }

    async deleteQuiz(id: string): Promise<void> {
        try {
            await deleteQuizApi(id);
            runInAction(() => {
                this.quizList = this.quizList.filter((q) => q.id !== id);
            });
        } catch {
            console.error('Failed to delete Quiz');
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

    getById(id: string): Quiz | undefined {
        return this.quizList.find((q) => q.id === id);
    }
}
