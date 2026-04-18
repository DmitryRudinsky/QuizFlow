import { RootStore } from '@app/model/rootStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@shared/api/generated', () => ({
    getQuizzesByUser: vi.fn(),
    getQuiz: vi.fn(),
    createQuiz: vi.fn(),
    updateQuiz: vi.fn(),
    deleteQuiz: vi.fn(),
}));

import * as api from '@shared/api/generated';

describe('QuizStore', () => {
    let root: RootStore;

    beforeEach(() => {
        root = new RootStore();
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('starts with empty quizList', () => {
            expect(root.quiz.quizList).toHaveLength(0);
            expect(root.quiz.totalQuizzes).toBe(0);
        });
    });

    describe('fetchByUser', () => {
        it('populates quizList on success', async () => {
            vi.mocked(api.getQuizzesByUser).mockResolvedValue({
                data: [
                    {
                        id: '1',
                        title: 'JS Basics',
                        description: '',
                        category: '',
                        createdBy: 'u1',
                        createdAt: '',
                        questionCount: 5,
                    },
                ],
                status: 200,
                headers: new Headers(),
            } as never);

            root.user.setUser({ id: 'u1', name: 'Test', email: 't@t.com', role: 'organizer' });
            await root.quiz.fetchByUser();

            expect(root.quiz.quizList).toHaveLength(1);
            expect(root.quiz.quizList[0].title).toBe('JS Basics');
        });
    });

    describe('deleteQuiz', () => {
        it('removes quiz from list on success', async () => {
            vi.mocked(api.deleteQuiz).mockResolvedValue({
                data: undefined,
                status: 204,
                headers: new Headers(),
            } as never);

            root.quiz.quizList = [
                {
                    id: '1',
                    title: 'Quiz',
                    description: '',
                    category: '',
                    createdBy: 'u1',
                    createdAt: '',
                    questions: [],
                    questionCount: 0,
                    settings: {
                        timePerQuestion: 30,
                        scoringMode: 'standard',
                        allowAnswerChanges: false,
                        randomizeQuestions: false,
                        showCorrectAnswers: 'after-each',
                    },
                },
            ];

            await root.quiz.deleteQuiz('1');
            expect(root.quiz.quizList).toHaveLength(0);
        });
    });

    describe('getById', () => {
        it('returns quiz by id', () => {
            root.quiz.quizList = [
                {
                    id: '42',
                    title: 'Found',
                    description: '',
                    category: '',
                    createdBy: 'u1',
                    createdAt: '',
                    questions: [],
                    questionCount: 0,
                    settings: {
                        timePerQuestion: 30,
                        scoringMode: 'standard',
                        allowAnswerChanges: false,
                        randomizeQuestions: false,
                        showCorrectAnswers: 'after-each',
                    },
                },
            ];
            expect(root.quiz.getById('42')?.title).toBe('Found');
            expect(root.quiz.getById('nonexistent')).toBeUndefined();
        });
    });
});
