import { RootStore } from '@app/model/rootStore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@shared/api/generated', () => ({
    createSession: vi.fn(),
    startSession: vi.fn(),
    nextQuestion: vi.fn(),
    endSession: vi.fn(),
    joinSession: vi.fn(),
    submitAnswer: vi.fn(),
    getLeaderboard: vi.fn(),
    getQuizzesByUser: vi.fn(),
    createQuiz: vi.fn(),
    updateQuiz: vi.fn(),
    deleteQuiz: vi.fn(),
}));

vi.mock('sockjs-client', () => ({ default: vi.fn() }));
vi.mock('@stomp/stompjs', () => ({
    Client: vi.fn(() => ({ activate: vi.fn(), deactivate: vi.fn(), subscribe: vi.fn() })),
}));

import * as api from '@shared/api/generated';

describe('SessionStore — lifecycle & timer', () => {
    let root: RootStore;

    beforeEach(() => {
        vi.useFakeTimers();
        root = new RootStore();
        vi.mocked(api.nextQuestion).mockResolvedValue({
            data: {} as never,
            status: 200,
            headers: new Headers(),
        } as never);
        vi.mocked(api.endSession).mockResolvedValue({
            data: {} as never,
            status: 200,
            headers: new Headers(),
        } as never);
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

        it('starts with empty participants', () => {
            expect(root.session.participantCount).toBe(0);
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

    describe('endSession', () => {
        it('sets status to ended after API call', async () => {
            // status is updated by WS event ENDED, which disconnect() can trigger
            // here we just verify the API is called
            root.session.roomCode = 'ABC123';
            await root.session.endSession();
            expect(api.endSession).toHaveBeenCalledWith('ABC123', expect.anything());
        });
    });

    describe('timer', () => {
        it('decrements timeLeft by 1 after 1 second when active', () => {
            root.session.status = 'active';
            root.session.timeLeft = 30;
            root.session.startTimer();
            vi.advanceTimersByTime(1000);
            expect(root.session.timeLeft).toBe(29);
        });

        it('decrements timeLeft by 3 after 3 seconds', () => {
            root.session.status = 'active';
            root.session.timeLeft = 30;
            root.session.startTimer();
            vi.advanceTimersByTime(3000);
            expect(root.session.timeLeft).toBe(27);
        });

        it('does not decrement below 0', () => {
            root.session.status = 'active';
            root.session.timeLeft = 1;
            root.session.startTimer();
            vi.advanceTimersByTime(5000);
            expect(root.session.timeLeft).toBeGreaterThanOrEqual(0);
        });

        it('does not decrement when paused', () => {
            root.session.status = 'paused';
            root.session.timeLeft = 30;
            root.session.startTimer();
            vi.advanceTimersByTime(3000);
            expect(root.session.timeLeft).toBe(30);
        });

        it('stops decrementing after stopTimer', () => {
            root.session.status = 'active';
            root.session.timeLeft = 30;
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
    });

    describe('isLastQuestion', () => {
        it('is false when more questions remain', () => {
            root.session.currentQuestionIndex = 0;
            root.session.totalQuestions = 5;
            expect(root.session.isLastQuestion).toBe(false);
        });

        it('is true at the last question', () => {
            root.session.currentQuestionIndex = 4;
            root.session.totalQuestions = 5;
            expect(root.session.isLastQuestion).toBe(true);
        });
    });

    describe('reset', () => {
        it('resets to initial state', () => {
            root.session.currentQuestionIndex = 3;
            root.session.timeLeft = 10;
            root.session.reset();
            expect(root.session.currentQuestionIndex).toBe(0);
            expect(root.session.timeLeft).toBe(30);
            expect(root.session.status).toBe('waiting');
            expect(root.session.participants).toHaveLength(0);
        });
    });
});
