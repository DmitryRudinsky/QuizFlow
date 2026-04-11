import type { RootStore } from '@app/model/rootStore';
import type { Participant } from '@entities/Participant/model/types';
import type { Question } from '@entities/Question/model/types';
import { makeAutoObservable } from 'mobx';

type SessionStatus = 'waiting' | 'active' | 'paused' | 'ended';

const MOCK_QUESTION: Question = {
    id: '1',
    type: 'text',
    questionText: 'What is the output of: console.log(typeof null)?',
    answerType: 'single',
    answers: [
        { id: 'a1', text: 'null', isCorrect: false },
        { id: 'a2', text: 'object', isCorrect: true },
        { id: 'a3', text: 'undefined', isCorrect: false },
        { id: 'a4', text: 'number', isCorrect: false },
    ],
    timeLimit: 30,
    points: 100,
};

const MOCK_PARTICIPANTS: Participant[] = [
    { id: '1', name: 'Alice', score: 0, answers: {}, joinedAt: new Date().toISOString() },
    { id: '2', name: 'Bob', score: 0, answers: {}, joinedAt: new Date().toISOString() },
    { id: '3', name: 'Charlie', score: 0, answers: {}, joinedAt: new Date().toISOString() },
    { id: '4', name: 'Diana', score: 0, answers: {}, joinedAt: new Date().toISOString() },
    { id: '5', name: 'Eve', score: 0, answers: {}, joinedAt: new Date().toISOString() },
    { id: '6', name: 'Frank', score: 0, answers: {}, joinedAt: new Date().toISOString() },
    { id: '7', name: 'Grace', score: 0, answers: {}, joinedAt: new Date().toISOString() },
    { id: '8', name: 'Henry', score: 0, answers: {}, joinedAt: new Date().toISOString() },
];

export class SessionStore {
    roomCode = 'ABC-123';
    participants: Participant[] = MOCK_PARTICIPANTS;
    currentQuestionIndex = 0;
    totalQuestions = 15;
    timeLeft = 30;
    status: SessionStatus = 'active';
    answerStats: Record<string, number> = { a1: 15, a2: 60, a3: 20, a4: 5 };
    participantAnswered: Record<string, boolean> = {
        '1': true,
        '2': true,
        '3': false,
        '4': true,
        '5': true,
        '6': false,
        '7': true,
        '8': true,
    };

    private timer: ReturnType<typeof setInterval> | null = null;
    private root: RootStore;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
    }

    get currentQuestion(): Question {
        return MOCK_QUESTION;
    }

    get answeredCount(): number {
        return Object.values(this.participantAnswered).filter(Boolean).length;
    }

    get participantCount(): number {
        return this.participants.length;
    }

    get isLastQuestion(): boolean {
        return this.currentQuestionIndex + 1 >= this.totalQuestions;
    }

    startTimer(): void {
        this.stopTimer();
        this.timer = setInterval(() => {
            if (this.status === 'active' && this.timeLeft > 0) {
                this.timeLeft -= 1;
            } else if (this.timeLeft <= 0) {
                this.stopTimer();
            }
        }, 1000);
    }

    stopTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    nextQuestion(): void {
        if (!this.isLastQuestion) {
            this.currentQuestionIndex += 1;
            this.timeLeft = 30;
            this.status = 'active';
            this.participantAnswered = Object.fromEntries(
                this.participants.map((p) => [p.id, false]),
            );
        }
    }

    togglePause(): void {
        if (this.status === 'active') {
            this.status = 'paused';
            this.stopTimer();
        } else if (this.status === 'paused') {
            this.status = 'active';
            this.startTimer();
        }
    }

    endSession(): void {
        this.status = 'ended';
        this.stopTimer();
    }

    reset(): void {
        this.stopTimer();
        this.currentQuestionIndex = 0;
        this.timeLeft = 30;
        this.status = 'waiting';
        this.participants = [];
        this.participantAnswered = {};
    }
}
