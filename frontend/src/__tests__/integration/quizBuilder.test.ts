import { RootStore } from '@app/model/rootStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { CREATED_QUIZ_DETAIL, FIXTURE_QUIZ_DETAIL } = vi.hoisted(() => ({
    CREATED_QUIZ_DETAIL: {
        id: 'srv-new-id',
        title: 'My Quiz',
        description: '',
        category: '',
        createdBy: 'user-1',
        createdAt: '2026-01-01T00:00:00Z',
        questions: [],
    },
    FIXTURE_QUIZ_DETAIL: {
        id: '1',
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of JavaScript core concepts',
        category: 'programming',
        createdBy: 'organizer-1',
        createdAt: '2026-04-08T10:00:00Z',
        questions: [],
    },
}));

vi.mock('@shared/api/generated', () => ({
    login: vi.fn().mockResolvedValue({
        data: { id: 'user-1', name: 'alice', email: 'alice@example.com', role: 'organizer' },
        status: 200,
        headers: new Headers(),
    }),
    register: vi.fn(),
    getQuizzesByUser: vi.fn(),
    getQuiz: vi.fn().mockImplementation(async (id: string) => ({
        data: id === 'srv-new-id' ? CREATED_QUIZ_DETAIL : FIXTURE_QUIZ_DETAIL,
        status: 200,
        headers: new Headers(),
    })),
    createQuiz: vi.fn().mockResolvedValue({
        data: CREATED_QUIZ_DETAIL,
        status: 201,
        headers: new Headers(),
    }),
    updateQuiz: vi.fn().mockResolvedValue({
        data: FIXTURE_QUIZ_DETAIL,
        status: 200,
        headers: new Headers(),
    }),
    deleteQuiz: vi.fn().mockResolvedValue({ status: 204, headers: new Headers() }),
    addQuestion: vi.fn().mockResolvedValue({
        data: FIXTURE_QUIZ_DETAIL,
        status: 201,
        headers: new Headers(),
    }),
}));

const INITIAL_QUIZ_COUNT = 1;

const FIXTURE_QUIZ = {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript core concepts',
    category: 'programming',
    questions: [],
    settings: {
        timePerQuestion: 30,
        scoringMode: 'standard' as const,
        allowAnswerChanges: false,
        randomizeQuestions: false,
        showCorrectAnswers: 'after-each' as const,
    },
    createdBy: 'organizer-1',
    createdAt: '2026-04-08T10:00:00Z',
};

function buildValidQuiz(root: RootStore) {
    root.quizBuilder.setTitle('My Quiz');
    root.quizBuilder.addQuestion();
}

describe('QuizBuilderStore ↔ QuizStore integration', () => {
    let root: RootStore;

    beforeEach(() => {
        root = new RootStore();
        root.quiz.addQuiz(FIXTURE_QUIZ);
        vi.clearAllMocks();
    });

    describe('save — new quiz', () => {
        it('returns true when title and questions are present', async () => {
            buildValidQuiz(root);
            expect(await root.quizBuilder.save()).toBe(true);
        });

        it('calls createQuiz with correct title', async () => {
            const { createQuiz } = await import('@shared/api/generated');
            buildValidQuiz(root);
            await root.quizBuilder.save();
            expect(vi.mocked(createQuiz)).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'My Quiz' }),
            );
        });

        it('calls addQuestion for each new question', async () => {
            const { addQuestion } = await import('@shared/api/generated');
            buildValidQuiz(root);
            root.quizBuilder.addQuestion();
            await root.quizBuilder.save();
            expect(vi.mocked(addQuestion)).toHaveBeenCalledTimes(2);
        });

        it('adds the new quiz to the store after save', async () => {
            buildValidQuiz(root);
            await root.quizBuilder.save();
            expect(root.quiz.quizList).toHaveLength(INITIAL_QUIZ_COUNT + 1);
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
            const { createQuiz } = await import('@shared/api/generated');
            root.quizBuilder.setTitle('My Quiz');
            await root.quizBuilder.save();
            expect(vi.mocked(createQuiz)).not.toHaveBeenCalled();
        });
    });

    describe('loadForEdit + save — existing quiz', () => {
        it('populates fields from quizStore', () => {
            const quiz = root.quiz.getById('1')!;
            root.quizBuilder.loadForEdit('1');
            expect(root.quizBuilder.quizTitle).toBe(quiz.title);
            expect(root.quizBuilder.description).toBe(quiz.description);
            expect(root.quizBuilder.category).toBe(quiz.category);
        });

        it('does nothing for unknown id', () => {
            root.quizBuilder.loadForEdit('nonexistent');
            expect(root.quizBuilder.quizTitle).toBe('');
        });

        it('calls updateQuiz with the new title when saving', async () => {
            const { updateQuiz } = await import('@shared/api/generated');
            root.quizBuilder.loadForEdit('1');
            root.quizBuilder.setTitle('Updated Title');
            root.quizBuilder.addQuestion();
            await root.quizBuilder.save();
            expect(vi.mocked(updateQuiz)).toHaveBeenCalledWith(
                '1',
                expect.objectContaining({ title: 'Updated Title' }),
            );
        });

        it('does not call createQuiz when updating', async () => {
            const { createQuiz } = await import('@shared/api/generated');
            root.quizBuilder.loadForEdit('1');
            root.quizBuilder.setTitle('Updated Title');
            root.quizBuilder.addQuestion();
            await root.quizBuilder.save();
            expect(vi.mocked(createQuiz)).not.toHaveBeenCalled();
        });

        it('does not add a new quiz entry when updating', async () => {
            root.quizBuilder.loadForEdit('1');
            root.quizBuilder.setTitle('Updated Title');
            root.quizBuilder.addQuestion();
            await root.quizBuilder.save();
            expect(root.quiz.quizList).toHaveLength(INITIAL_QUIZ_COUNT);
        });

        it('only sends new questions (without UUID ids) to addQuestion', async () => {
            const { addQuestion } = await import('@shared/api/generated');
            // Simulate quiz with one existing question (UUID id)
            root.quiz.updateQuiz('1', {
                questions: [
                    {
                        id: '00000000-0000-0000-0000-000000000001',
                        type: 'text',
                        questionText: 'Existing question',
                        answerType: 'single',
                        answers: [
                            { id: 'a1', text: 'A', isCorrect: true },
                            { id: 'a2', text: 'B', isCorrect: false },
                        ],
                        timeLimit: 30,
                        points: 100,
                    },
                ],
            });
            root.quizBuilder.loadForEdit('1');
            root.quizBuilder.addQuestion(); // new question with timestamp id
            await root.quizBuilder.save();
            expect(vi.mocked(addQuestion)).toHaveBeenCalledTimes(1);
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
            expect(answers).toHaveLength(2);
            root.quizBuilder.deleteAnswer(qId, answers[0].id);
            expect(root.quizBuilder.currentQuestion!.answers).toHaveLength(2);
        });

        it('deleteAnswer removes when more than 2 answers exist', () => {
            root.quizBuilder.addQuestion();
            const qId = root.quizBuilder.selectedQuestionId!;
            root.quizBuilder.addAnswer(qId);
            const answers = root.quizBuilder.currentQuestion!.answers;
            expect(answers).toHaveLength(3);
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

    describe('selectQuestion', () => {
        it('after addQuestion + selectQuestion(null), currentQuestion is undefined', () => {
            root.quizBuilder.addQuestion();
            root.quizBuilder.selectQuestion(null);
            expect(root.quizBuilder.currentQuestion).toBeUndefined();
        });
    });

    describe('updateQuestion', () => {
        it('updates questionText on an existing question', () => {
            root.quizBuilder.addQuestion();
            const qId = root.quizBuilder.selectedQuestionId!;
            root.quizBuilder.updateQuestion(qId, { questionText: 'New text' });
            expect(root.quizBuilder.currentQuestion!.questionText).toBe('New text');
        });

        it('does nothing for an unknown question id', () => {
            root.quizBuilder.addQuestion();
            root.quizBuilder.updateQuestion('nonexistent', { questionText: 'Should not appear' });
            expect(root.quizBuilder.questions).toHaveLength(1);
        });
    });

    describe('addAnswer', () => {
        it('increases answer count from 2 to 3', () => {
            root.quizBuilder.addQuestion();
            const qId = root.quizBuilder.selectedQuestionId!;
            root.quizBuilder.addAnswer(qId);
            expect(root.quizBuilder.currentQuestion!.answers).toHaveLength(3);
        });

        it('does nothing for an unknown question id', () => {
            root.quizBuilder.addQuestion();
            root.quizBuilder.addAnswer('nonexistent');
            expect(root.quizBuilder.currentQuestion!.answers).toHaveLength(2);
        });
    });

    describe('updateAnswer', () => {
        it('updates text on an existing answer', () => {
            root.quizBuilder.addQuestion();
            const qId = root.quizBuilder.selectedQuestionId!;
            const answerId = root.quizBuilder.currentQuestion!.answers[0].id;
            root.quizBuilder.updateAnswer(qId, answerId, { text: 'Updated answer' });
            expect(root.quizBuilder.currentQuestion!.answers[0].text).toBe('Updated answer');
        });

        it('does nothing for an unknown question id', () => {
            root.quizBuilder.addQuestion();
            const answerId = root.quizBuilder.currentQuestion!.answers[0].id;
            root.quizBuilder.updateAnswer('nonexistent', answerId, { text: 'Should not appear' });
            expect(root.quizBuilder.currentQuestion!.answers[0].text).toBe('');
        });
    });
});
