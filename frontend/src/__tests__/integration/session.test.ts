import { RootStore } from '@app/model/rootStore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('SessionStore — lifecycle & timer', () => {
    let root: RootStore;

    beforeEach(() => {
        vi.useFakeTimers();
        root = new RootStore();
    });

    afterEach(() => {
        root.session.stopTimer();
        vi.useRealTimers();
    });

    describe('initial state', () => {
        it('starts with status active', () => {
            expect(root.session.status).toBe('active');
        });

        it('starts at question index 0', () => {
            expect(root.session.currentQuestionIndex).toBe(0);
        });

        it('isLastQuestion is false initially', () => {
            expect(root.session.isLastQuestion).toBe(false);
        });

        it('participantCount matches mock participants', () => {
            expect(root.session.participantCount).toBe(8);
        });
    });

    describe('nextQuestion', () => {
        it('increments currentQuestionIndex', () => {
            root.session.nextQuestion();
            expect(root.session.currentQuestionIndex).toBe(1);
        });

        it('resets timeLeft to 30', () => {
            root.session.timeLeft = 10;
            root.session.nextQuestion();
            expect(root.session.timeLeft).toBe(30);
        });

        it('resets participantAnswered to all false', () => {
            root.session.nextQuestion();
            const allFalse = Object.values(root.session.participantAnswered).every((v) => !v);
            expect(allFalse).toBe(true);
        });

        it('sets status back to active', () => {
            root.session.togglePause();
            root.session.nextQuestion();
            expect(root.session.status).toBe('active');
        });

        it('isLastQuestion becomes true at the last question', () => {
            root.session.currentQuestionIndex = root.session.totalQuestions - 1;
            expect(root.session.isLastQuestion).toBe(true);
        });

        it('does not advance past the last question', () => {
            root.session.currentQuestionIndex = root.session.totalQuestions - 1;
            root.session.nextQuestion();
            expect(root.session.currentQuestionIndex).toBe(root.session.totalQuestions - 1);
        });
    });

    describe('togglePause', () => {
        it('pauses an active session', () => {
            root.session.togglePause();
            expect(root.session.status).toBe('paused');
        });

        it('resumes a paused session', () => {
            root.session.togglePause();
            root.session.togglePause();
            expect(root.session.status).toBe('active');
        });
    });

    describe('endSession', () => {
        it('sets status to ended', () => {
            root.session.endSession();
            expect(root.session.status).toBe('ended');
        });
    });

    describe('timer', () => {
        it('decrements timeLeft by 1 after 1 second', () => {
            root.session.startTimer();
            vi.advanceTimersByTime(1000);
            expect(root.session.timeLeft).toBe(29);
        });

        it('decrements timeLeft by 3 after 3 seconds', () => {
            root.session.startTimer();
            vi.advanceTimersByTime(3000);
            expect(root.session.timeLeft).toBe(27);
        });

        it('does not decrement below 0', () => {
            root.session.timeLeft = 1;
            root.session.startTimer();
            vi.advanceTimersByTime(5000);
            expect(root.session.timeLeft).toBeGreaterThanOrEqual(0);
        });

        it('does not decrement when paused', () => {
            root.session.togglePause();
            root.session.startTimer();
            vi.advanceTimersByTime(3000);
            expect(root.session.timeLeft).toBe(30);
        });

        it('stops decrementing after stopTimer', () => {
            root.session.startTimer();
            vi.advanceTimersByTime(1000);
            root.session.stopTimer();
            const timeAfterStop = root.session.timeLeft;
            vi.advanceTimersByTime(3000);
            expect(root.session.timeLeft).toBe(timeAfterStop);
        });
    });

    describe('answeredCount', () => {
        it('counts participants who answered', () => {
            // mock data: 6 out of 8 answered
            const answered = Object.values(root.session.participantAnswered).filter(Boolean).length;
            expect(root.session.answeredCount).toBe(answered);
        });
    });

    describe('reset', () => {
        it('resets to initial state', () => {
            root.session.nextQuestion();
            root.session.nextQuestion();
            root.session.reset();
            expect(root.session.currentQuestionIndex).toBe(0);
            expect(root.session.timeLeft).toBe(30);
            expect(root.session.status).toBe('waiting');
            expect(root.session.participants).toHaveLength(0);
        });
    });
});
