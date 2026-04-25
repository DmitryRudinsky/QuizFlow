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
        it('starts with status waiting', () => {
            expect(root.session.status).toBe('waiting');
        });

        it('starts at question index 0', () => {
            expect(root.session.currentQuestionIndex).toBe(0);
        });

        it('starts with no current question', () => {
            expect(root.session.currentQuestion).toBeNull();
        });

        it('participantCount is 0 initially', () => {
            expect(root.session.participantCount).toBe(0);
        });

        it('isLastQuestion is true when totalQuestions is 0', () => {
            expect(root.session.isLastQuestion).toBe(true);
        });
    });

    describe('togglePause', () => {
        it('pauses an active session', () => {
            root.session.status = 'active';
            root.session.togglePause();
            expect(root.session.status).toBe('paused');
        });

        it('resumes a paused session', () => {
            root.session.status = 'active';
            root.session.togglePause();
            root.session.togglePause();
            expect(root.session.status).toBe('active');
        });
    });

    describe('timer', () => {
        beforeEach(() => {
            root.session.status = 'active';
            root.session.timeLeft = 30;
        });

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
            root.session.participantAnswered = { p1: true, p2: false, p3: true };
            expect(root.session.answeredCount).toBe(2);
        });

        it('returns 0 when no one answered', () => {
            expect(root.session.answeredCount).toBe(0);
        });
    });

    describe('reset', () => {
        it('resets to initial state', () => {
            root.session.status = 'active';
            root.session.timeLeft = 15;
            root.session.currentQuestionIndex = 3;
            root.session.reset();
            expect(root.session.currentQuestionIndex).toBe(0);
            expect(root.session.timeLeft).toBe(0);
            expect(root.session.status).toBe('waiting');
            expect(root.session.participants).toHaveLength(0);
        });
    });
});
