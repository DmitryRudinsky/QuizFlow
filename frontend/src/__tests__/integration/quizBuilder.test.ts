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

const mockQuizResponse = (id: string, title: string) => ({
    data: {
        id,
        title,
        description: '',
        category: '',
        createdBy: 'u1',
        createdAt: new Date().toISOString(),
        questionCount: 0,
    },
    status: 201,
    headers: new Headers(),
});

function buildValidQuiz(root: RootStore) {
    root.quizBuilder.setTitle('My Quiz');
    root.quizBuilder.addQuestion();
}

describe('QuizBuilderStore ↔ QuizStore integration', () => {
    let root: RootStore;

    beforeEach(() => {
        root = new RootStore();
        vi.clearAllMocks();
        vi.mocked(api.createQuiz).mockResolvedValue(mockQuizResponse('new-1', 'My Quiz') as never);
        vi.mocked(api.updateQuiz).mockResolvedValue(
            mockQuizResponse('1', 'Updated Title') as never,
        );
    });

    describe('save — new quiz', () => {
        it('returns true when title and questions are present', async () => {
            buildValidQuiz(root);
            expect(await root.quizBuilder.save()).toBe(true);
        });

        it('adds quiz to quizStore', async () => {
            buildValidQuiz(root);
            await root.quizBuilder.save();
            expect(root.quiz.quizList).toHaveLength(1);
        });

        it('prepends new quiz to the list', async () => {
            buildValidQuiz(root);
            await root.quizBuilder.save();
            expect(root.quiz.quizList[0].title).toBe('My Quiz');
        });

        it('returns false without title', async () => {
            root.quizBuilder.addQuestion();
            expect(await root.quizBuilder.save()).toBe(false);
        });

        it('returns false without questions', async () => {
            root.quizBuilder.setTitle('My Quiz');
            expect(await root.quizBuilder.save()).toBe(false);
        });

        it('does not call API when validation fails', async () => {
            root.quizBuilder.setTitle('My Quiz');
            await root.quizBuilder.save();
            expect(api.createQuiz).not.toHaveBeenCalled();
        });
    });

    describe('loadForEdit + save — existing quiz', () => {
        beforeEach(() => {
            root.quiz.quizList = [
                {
                    id: '1',
                    title: 'JS Basics',
                    description: 'Test desc',
                    category: 'programming',
                    createdBy: 'u1',
                    createdAt: new Date().toISOString(),
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
        });

        it('populates fields from quizStore', () => {
            root.quizBuilder.loadForEdit('1');
            expect(root.quizBuilder.quizTitle).toBe('JS Basics');
            expect(root.quizBuilder.description).toBe('Test desc');
            expect(root.quizBuilder.category).toBe('programming');
        });

        it('does nothing for unknown id', () => {
            root.quizBuilder.loadForEdit('nonexistent');
            expect(root.quizBuilder.quizTitle).toBe('');
        });

        it('calls updateQuiz when saving existing quiz', async () => {
            root.quizBuilder.loadForEdit('1');
            root.quizBuilder.setTitle('Updated Title');
            root.quizBuilder.addQuestion();
            await root.quizBuilder.save();
            expect(api.updateQuiz).toHaveBeenCalledWith(
                '1',
                expect.objectContaining({ title: 'Updated Title' }),
                expect.anything(),
            );
        });
    });

    describe('question management', () => {
        it('isEmpty is true initially', () => {
            expect(root.quizBuilder.isEmpty).toBe(true);
        });

        it('isEmpty is false after addQuestion', () => {
            root.quizBuilder.addQuestion();
            expect(root.quizBuilder.isEmpty).toBe(false);
        });

        it('addQuestion selects the new question', () => {
            root.quizBuilder.addQuestion();
            expect(root.quizBuilder.selectedQuestionId).not.toBeNull();
            expect(root.quizBuilder.currentQuestion).toBeDefined();
        });

        it('deleteQuestion removes it from the list', () => {
            root.quizBuilder.addQuestion();
            const id = root.quizBuilder.selectedQuestionId!;
            root.quizBuilder.deleteQuestion(id);
            expect(root.quizBuilder.isEmpty).toBe(true);
        });

        it('deleteQuestion clears selectedQuestionId', () => {
            root.quizBuilder.addQuestion();
            const id = root.quizBuilder.selectedQuestionId!;
            root.quizBuilder.deleteQuestion(id);
            expect(root.quizBuilder.selectedQuestionId).toBeNull();
        });

        it('deleteAnswer does not remove if only 2 answers remain', () => {
            root.quizBuilder.addQuestion();
            const qId = root.quizBuilder.selectedQuestionId!;
            const answers = root.quizBuilder.currentQuestion!.answers;
            root.quizBuilder.deleteAnswer(qId, answers[0].id);
            expect(root.quizBuilder.currentQuestion!.answers).toHaveLength(2);
        });

        it('deleteAnswer removes when more than 2 answers exist', () => {
            root.quizBuilder.addQuestion();
            const qId = root.quizBuilder.selectedQuestionId!;
            root.quizBuilder.addAnswer(qId);
            const answers = root.quizBuilder.currentQuestion!.answers;
            root.quizBuilder.deleteAnswer(qId, answers[0].id);
            expect(root.quizBuilder.currentQuestion!.answers).toHaveLength(2);
        });
    });

    describe('reset', () => {
        it('clears all fields', () => {
            buildValidQuiz(root);
            root.quizBuilder.setDescription('desc');
            root.quizBuilder.reset();
            expect(root.quizBuilder.quizTitle).toBe('');
            expect(root.quizBuilder.description).toBe('');
            expect(root.quizBuilder.questions).toHaveLength(0);
            expect(root.quizBuilder.selectedQuestionId).toBeNull();
            expect(root.quizBuilder.quizId).toBeNull();
        });
    });

    describe('setCategory', () => {
        it('updates category', () => {
            root.quizBuilder.setCategory('science');
            expect(root.quizBuilder.category).toBe('science');
        });
    });

    describe('updateSettings', () => {
        it('updates specified setting, leaving others unchanged', () => {
            const before = { ...root.quizBuilder.settings };
            root.quizBuilder.updateSettings({ timePerQuestion: 45 });
            expect(root.quizBuilder.settings.timePerQuestion).toBe(45);
            expect(root.quizBuilder.settings.scoringMode).toBe(before.scoringMode);
        });
    });

    describe('updateQuestion', () => {
        it('updates questionText on an existing question', () => {
            root.quizBuilder.addQuestion();
            const qId = root.quizBuilder.selectedQuestionId!;
            root.quizBuilder.updateQuestion(qId, { questionText: 'New text' });
            expect(root.quizBuilder.currentQuestion!.questionText).toBe('New text');
        });
    });

    describe('addAnswer', () => {
        it('increases answer count from 2 to 3', () => {
            root.quizBuilder.addQuestion();
            const qId = root.quizBuilder.selectedQuestionId!;
            root.quizBuilder.addAnswer(qId);
            expect(root.quizBuilder.currentQuestion!.answers).toHaveLength(3);
        });
    });
});
