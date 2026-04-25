import type { RootStore } from '@app/model/rootStore';
import type { Participant } from '@entities/Participant/model/types';
import type { Question } from '@entities/Question/model/types';
import type { AnswerResultResponse, LeaderboardEntryResponse } from '@shared/api/generated';
import {
    createSession as createSessionApi,
    endSession as endSessionApi,
    getLeaderboard,
    joinSession as joinSessionApi,
    nextQuestion as nextQuestionApi,
    startSession as startSessionApi,
    submitAnswer as submitAnswerApi,
} from '@shared/api/generated';
import { Client } from '@stomp/stompjs';
import { makeAutoObservable, runInAction } from 'mobx';

type SessionStatus = 'waiting' | 'active' | 'paused' | 'ended';

interface QuestionPayload {
    questionIndex: number;
    totalQuestions: number;
    questionId: string;
    questionText: string;
    answers: Array<{ id: string; text: string }>;
    timeLimit: number;
    points: number;
}

interface SessionEvent {
    type: string;
    payload: unknown;
}

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:5173/ws-stomp';

export class SessionStore {
    roomCode: string | null = null;
    participantId: string | null = null;
    participants: Participant[] = [];
    currentQuestion: Question | null = null;
    currentQuestionIndex = 0;
    totalQuestions = 0;
    timeLeft = 0;
    status: SessionStatus = 'waiting';
    answerStats: Record<string, number> = {};
    participantAnswered: Record<string, boolean> = {};
    leaderboard: LeaderboardEntryResponse[] = [];

    private timer: ReturnType<typeof setInterval> | null = null;
    private stompClient: Client | null = null;
    private root: RootStore;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable<SessionStore, 'stompClient' | 'timer'>(this, {
            stompClient: false,
            timer: false,
        });
    }

    get answeredCount(): number {
        return Object.values(this.participantAnswered).filter(Boolean).length;
    }

    get participantCount(): number {
        return this.participants.length;
    }

    get isLastQuestion(): boolean {
        return this.currentQuestionIndex >= this.totalQuestions;
    }

    startTimer(): void {
        this.stopTimer();
        this.timer = setInterval(() => {
            runInAction(() => {
                if (this.status === 'active' && this.timeLeft > 0) {
                    this.timeLeft -= 1;
                } else if (this.timeLeft <= 0) {
                    this.stopTimer();
                }
            });
        }, 1000);
    }

    stopTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
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

    connect(roomCode: string): void {
        if (this.stompClient?.active) {
            return;
        }

        runInAction(() => {
            this.roomCode = roomCode;
        });

        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/session/${roomCode}`, (message) => {
                    try {
                        const event = JSON.parse(message.body) as SessionEvent;
                        this.handleEvent(event);
                    } catch {
                        // ignore malformed messages
                    }
                });
            },
        });

        client.activate();
        this.stompClient = client;
    }

    disconnect(): void {
        this.stompClient?.deactivate();
        this.stompClient = null;
    }

    private handleEvent(event: SessionEvent): void {
        switch (event.type) {
            case 'QUESTION_STARTED': {
                const p = event.payload as QuestionPayload;
                runInAction(() => {
                    this.currentQuestion = {
                        id: p.questionId,
                        type: 'text',
                        questionText: p.questionText,
                        answerType: 'single',
                        answers: p.answers.map((a) => ({
                            id: a.id,
                            text: a.text,
                            isCorrect: false,
                        })),
                        timeLimit: p.timeLimit,
                        points: p.points,
                    };
                    this.currentQuestionIndex = p.questionIndex;
                    this.totalQuestions = p.totalQuestions;
                    this.timeLeft = p.timeLimit;
                    this.status = 'active';
                    this.answerStats = {};
                    this.participantAnswered = Object.fromEntries(
                        this.participants.map((part) => [part.id, false]),
                    );
                });
                this.startTimer();
                break;
            }
            case 'SESSION_ENDED':
                runInAction(() => {
                    this.status = 'ended';
                });
                this.stopTimer();
                break;
            case 'SESSION_PAUSED':
                runInAction(() => {
                    this.status = 'paused';
                });
                this.stopTimer();
                break;
            case 'SESSION_RESUMED':
                runInAction(() => {
                    this.status = 'active';
                });
                this.startTimer();
                break;
            default:
                break;
        }
    }

    async sendNextQuestion(): Promise<void> {
        if (!this.roomCode) {
            return;
        }
        try {
            await nextQuestionApi(this.roomCode);
        } catch {
            // error is broadcast via WebSocket; REST errors are non-critical
        }
    }

    async sendEndSession(): Promise<void> {
        if (!this.roomCode) {
            return;
        }
        try {
            await endSessionApi(this.roomCode);
        } catch {
            // error is broadcast via WebSocket; REST errors are non-critical
        }
    }

    async createSession(quizId: string): Promise<string | null> {
        try {
            const res = await createSessionApi({ quizId });
            runInAction(() => {
                this.roomCode = res.data.roomCode;
                this.status = res.data.status as SessionStatus;
            });
            return res.data.roomCode;
        } catch {
            return null;
        }
    }

    async startSession(): Promise<void> {
        if (!this.roomCode) {
            return;
        }
        try {
            const res = await startSessionApi(this.roomCode);
            runInAction(() => {
                this.status = res.data.status as SessionStatus;
            });
        } catch {
            // ignore — the session may still be usable
        }
    }

    async joinSession(roomCode: string, nickname: string): Promise<boolean> {
        try {
            const res = await joinSessionApi(roomCode, { nickname });
            runInAction(() => {
                this.roomCode = roomCode;
                this.participantId = res.data.participantId;
            });
            return true;
        } catch {
            return false;
        }
    }

    async submitAnswer(
        questionId: string,
        answerIds: string[],
    ): Promise<AnswerResultResponse | null> {
        if (!this.roomCode || !this.participantId) {
            return null;
        }
        try {
            const res = await submitAnswerApi(this.roomCode, {
                participantId: this.participantId,
                questionId,
                answerIds,
            });
            return res.data;
        } catch {
            return null;
        }
    }

    async fetchLeaderboard(roomCodeOverride?: string): Promise<void> {
        const code = roomCodeOverride ?? this.roomCode;
        if (!code) {
            return;
        }
        try {
            const res = await getLeaderboard(code);
            runInAction(() => {
                this.roomCode = code;
                this.leaderboard = res.data;
            });
        } catch {
            // keep existing leaderboard on error
        }
    }

    reset(): void {
        this.stopTimer();
        this.disconnect();
        this.roomCode = null;
        this.participantId = null;
        this.currentQuestion = null;
        this.currentQuestionIndex = 0;
        this.totalQuestions = 0;
        this.timeLeft = 0;
        this.status = 'waiting';
        this.participants = [];
        this.answerStats = {};
        this.participantAnswered = {};
        this.leaderboard = [];
    }
}
