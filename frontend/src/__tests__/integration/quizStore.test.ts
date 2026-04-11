import { QuizStore } from '@entities/Quiz/model/quizStore';
import { beforeEach, describe, expect, it } from 'vitest';

const INITIAL_QUIZ_COUNT = 4;

describe('QuizStore', () => {
    let store: QuizStore;

    beforeEach(() => {
        store = new QuizStore();
    });

    describe('totalQuizzes', () => {
        it('equals quizList.length initially', () => {
            expect(store.totalQuizzes).toBe(INITIAL_QUIZ_COUNT);
        });

        it('updates after addQuiz', () => {
            store.addQuiz({
                id: 'new',
                title: 'New',
                description: '',
                category: '',
                questions: [],
                settings: {
                    timePerQuestion: 30,
                    scoringMode: 'standard',
                    allowAnswerChanges: false,
                    randomizeQuestions: false,
                    showCorrectAnswers: 'after-each',
                },
                createdBy: 'user-1',
                createdAt: new Date().toISOString(),
            });
            expect(store.totalQuizzes).toBe(INITIAL_QUIZ_COUNT + 1);
        });
    });

    describe('getById', () => {
        it('returns the correct quiz for a known id', () => {
            const quiz = store.getById('1');
            expect(quiz).toBeDefined();
            expect(quiz?.title).toBe('JavaScript Fundamentals');
        });

        it('returns undefined for an unknown id', () => {
            expect(store.getById('nonexistent')).toBeUndefined();
        });
    });

    describe('deleteQuiz', () => {
        it('removes the quiz from the list', () => {
            store.deleteQuiz('1');
            expect(store.quizList).toHaveLength(INITIAL_QUIZ_COUNT - 1);
        });

        it('the deleted quiz is no longer retrievable', () => {
            store.deleteQuiz('1');
            expect(store.getById('1')).toBeUndefined();
        });

        it('does nothing for an unknown id', () => {
            store.deleteQuiz('nonexistent');
            expect(store.quizList).toHaveLength(INITIAL_QUIZ_COUNT);
        });
    });

    describe('updateQuiz', () => {
        it('patches only the specified fields', () => {
            store.updateQuiz('1', { title: 'Updated Title' });
            const quiz = store.getById('1')!;
            expect(quiz.title).toBe('Updated Title');
            expect(quiz.description).toBe('Test your knowledge of JavaScript core concepts');
        });

        it('does nothing for an unknown id', () => {
            store.updateQuiz('nonexistent', { title: 'Should Not Appear' });
            expect(store.quizList).toHaveLength(INITIAL_QUIZ_COUNT);
        });
    });
});
