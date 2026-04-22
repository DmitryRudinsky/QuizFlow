import { RootStore } from '@app/model/rootStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@shared/api/generated', () => ({
    login: vi.fn().mockResolvedValue({
        data: { id: 'user-1', name: 'alice', email: 'alice@example.com', role: 'organizer' },
        status: 200,
        headers: new Headers(),
    }),
    register: vi.fn(),
    getQuizzesByUser: vi.fn(),
    getQuiz: vi.fn(),
    createQuiz: vi.fn(),
    updateQuiz: vi.fn(),
    deleteQuiz: vi.fn(),
}));

const INITIAL_QUIZ_COUNT = 4; // mock quizzes in QuizStore

function buildValidQuiz(root: RootStore) {
    root.quizBuilder.setTitle('My Quiz');
    root.quizBuilder.addQuestion();
}

describe('QuizBuilderStore ↔ QuizStore integration', () => {
    let root: RootStore;

    beforeEach(() => {
        root = new RootStore();
    });

    describe('save — new quiz', () => {
        it('returns true when title and questions are present', () => {
            buildValidQuiz(root);
            expect(root.quizBuilder.save()).toBe(true);
        });

        it('adds quiz to quizStore', () => {
            buildValidQuiz(root);
            root.quizBuilder.save();
            expect(root.quiz.quizList).toHaveLength(INITIAL_QUIZ_COUNT + 1);
        });

        it('prepends new quiz to the list', () => {
            buildValidQuiz(root);
            root.quizBuilder.save();
            expect(root.quiz.quizList[0].title).toBe('My Quiz');
        });

        it('returns false without title', () => {
            root.quizBuilder.addQuestion();
            expect(root.quizBuilder.save()).toBe(false);
        });

        it('returns false without questions', () => {
            root.quizBuilder.setTitle('My Quiz');
            expect(root.quizBuilder.save()).toBe(false);
        });

        it('does not add quiz to store when validation fails', () => {
            root.quizBuilder.setTitle('My Quiz');
            root.quizBuilder.save();
            expect(root.quiz.quizList).toHaveLength(INITIAL_QUIZ_COUNT);
        });

        it('sets createdBy from logged-in user', async () => {
            await root.auth.login('alice@example.com', 'pass');
            buildValidQuiz(root);
            root.quizBuilder.save();
            expect(root.quiz.quizList[0].createdBy).toBe(root.user.currentUser?.id);
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

        it('updates quiz in quizStore after save', () => {
            root.quizBuilder.loadForEdit('1');
            root.quizBuilder.setTitle('Updated Title');
            root.quizBuilder.addQuestion(); // mock quizzes have no questions — need at least one
            root.quizBuilder.save();
            expect(root.quiz.getById('1')?.title).toBe('Updated Title');
        });

        it('does not add a new quiz when updating', () => {
            root.quizBuilder.loadForEdit('1');
            root.quizBuilder.setTitle('Updated Title');
            root.quizBuilder.addQuestion();
            root.quizBuilder.save();
            expect(root.quiz.quizList).toHaveLength(INITIAL_QUIZ_COUNT);
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
