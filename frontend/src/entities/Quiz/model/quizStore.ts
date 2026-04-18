import type { RootStore } from '@app/model/rootStore';
import {
    createQuiz,
    deleteQuiz,
    getQuiz,
    getQuizzesByUser,
    updateQuiz,
} from '@shared/api/generated';
import { makeAutoObservable, runInAction } from 'mobx';

import type { Quiz } from './types';

export class QuizStore {
    quizList: Quiz[] = [];
    isLoading = false;
    error: string | null = null;
    private root: RootStore;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
    }

    private get userId(): string {
        return this.root.user.currentUser?.id ?? '';
    }

    get totalQuizzes(): number {
        return this.quizList.length;
    }

    async fetchByUser(): Promise<void> {
        if (!this.userId) {
            return;
        }
        this.isLoading = true;
        this.error = null;
        try {
            const res = await getQuizzesByUser({ userId: this.userId });
            runInAction(() => {
                this.quizList = res.data.map((q) => ({
                    id: q.id,
                    title: q.title,
                    description: q.description ?? '',
                    category: q.category ?? '',
                    coverImage: undefined,
                    createdBy: q.createdBy,
                    createdAt: q.createdAt,
                    questions: [],
                    questionCount: q.questionCount,
                    settings: {
                        timePerQuestion: 30,
                        scoringMode: 'standard',
                        allowAnswerChanges: false,
                        randomizeQuestions: false,
                        showCorrectAnswers: 'after-each',
                    },
                }));
            });
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Failed to load quizzes';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async fetchById(id: string): Promise<Quiz | null> {
        try {
            const res = await getQuiz(id);
            const q = res.data;
            return {
                id: q.id,
                title: q.title,
                description: q.description ?? '',
                category: q.category ?? '',
                coverImage: undefined,
                createdBy: q.createdBy,
                createdAt: q.createdAt,
                questionCount: q.questions.length,
                questions: q.questions.map((qq) => ({
                    id: qq.id,
                    type: qq.type,
                    questionText: qq.questionText,
                    answerType: qq.answerType,
                    timeLimit: qq.timeLimit,
                    points: qq.points,
                    // isCorrect not returned by API — set false as default
                    answers: qq.answers.map((a) => ({ id: a.id, text: a.text, isCorrect: false })),
                })),
                settings: {
                    timePerQuestion: 30,
                    scoringMode: 'standard',
                    allowAnswerChanges: false,
                    randomizeQuestions: false,
                    showCorrectAnswers: 'after-each',
                },
            };
        } catch {
            return null;
        }
    }

    async createQuiz(title: string, description?: string): Promise<Quiz | null> {
        try {
            const res = await createQuiz({ title, description }, { userId: this.userId });
            const q = res.data;
            const quiz: Quiz = {
                id: q.id,
                title: q.title,
                description: q.description ?? '',
                category: q.category ?? '',
                coverImage: undefined,
                createdBy: q.createdBy,
                createdAt: q.createdAt,
                questions: [],
                questionCount: 0,
                settings: {
                    timePerQuestion: 30,
                    scoringMode: 'standard',
                    allowAnswerChanges: false,
                    randomizeQuestions: false,
                    showCorrectAnswers: 'after-each',
                },
            };
            runInAction(() => this.quizList.unshift(quiz));
            return quiz;
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Failed to create quiz';
            });
            return null;
        }
    }

    async updateQuiz(id: string, updates: { title?: string; description?: string }): Promise<void> {
        try {
            const res = await updateQuiz(id, updates, { userId: this.userId });
            runInAction(() => {
                const index = this.quizList.findIndex((q) => q.id === id);
                if (index !== -1) {
                    this.quizList[index] = {
                        ...this.quizList[index],
                        title: res.data.title,
                        description: res.data.description ?? '',
                        category: res.data.category ?? '',
                        questionCount: res.data.questions.length,
                    };
                }
            });
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Failed to update quiz';
            });
        }
    }

    async deleteQuiz(id: string): Promise<void> {
        try {
            await deleteQuiz(id, { userId: this.userId });
            runInAction(() => {
                this.quizList = this.quizList.filter((q) => q.id !== id);
            });
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Failed to delete quiz';
            });
        }
    }

    getById(id: string): Quiz | undefined {
        return this.quizList.find((q) => q.id === id);
    }
}
