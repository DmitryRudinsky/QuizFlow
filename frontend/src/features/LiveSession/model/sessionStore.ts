import type { RootStore } from '@app/model/rootStore';
import type { Participant } from '@entities/Participant/model/types';
import type { Question } from '@entities/Question/model/types';
import type { AnswerResultResponse, LeaderboardEntryResponse } from '@shared/api/generated';
import {
    createSession as apiCreateSession,
    endSession as apiEndSession,
    getLeaderboard as apiGetLeaderboard,
    joinSession as apiJoinSession,
    nextQuestion as apiNextQuestion,
    startSession as apiStartSession,
    submitAnswer as apiSubmitAnswer,
} from '@shared/api/generated';
import { Client } from '@stomp/stompjs';
import { makeAutoObservable, runInAction } from 'mobx';
import SockJS from 'sockjs-client';

type SessionStatus = 'waiting' | 'active' | 'paused' | 'ended';

type WsEventType = 'QUESTION_STARTED' | 'QUESTION_ENDED' | 'PAUSED' | 'RESUMED' | 'ENDED';

interface QuestionPayload {
    questionIndex: number;
    totalQuestions: number;
    questionText: string;
    answers: Array<{ id: string; text: string }>;
    timeLimit: number;
}

interface SessionEvent {
    type: WsEventType;
    payload: QuestionPayload;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export class SessionStore {
    roomCode: string | null = null;
    sessionId: string | null = null;
    participantId: string | null = null;
    status: SessionStatus = 'waiting';
    currentQuestionIndex = 0;
    totalQuestions = 0;
    timeLeft = 30;
    currentQuestion: Question | null = null;

    participants: Participant[] = [];
    answerStats: Record<string, number> = {};
    participantAnswered: Record<string, boolean> = {};

    leaderboard: LeaderboardEntryResponse[] = [];

    isLoading = false;
    error: string | null = null;

    private root: RootStore;
    private stompClient: Client | null = null;
    private timer: ReturnType<typeof setInterval> | null = null;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
    }

    private get hostId(): string {
        return this.root.user.currentUser?.id ?? '';
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
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(`${BASE_URL}/ws`) as WebSocket,
            onConnect: () => {
                this.stompClient?.subscribe(`/topic/session/${roomCode}`, (msg) => {
                    const event: SessionEvent = JSON.parse(msg.body) as SessionEvent;
                    this.handleSessionEvent(event);
                });
            },
        });
        this.stompClient.activate();
    }

    disconnect(): void {
        this.stompClient?.deactivate();
        this.stompClient = null;
    }

    private handleSessionEvent(event: SessionEvent): void {
        runInAction(() => {
            switch (event.type) {
                case 'QUESTION_STARTED': {
                    const p = event.payload;
                    this.currentQuestionIndex = p.questionIndex;
                    this.totalQuestions = p.totalQuestions;
                    this.timeLeft = p.timeLimit;
                    this.currentQuestion = {
                        id: String(p.questionIndex),
                        type: 'text',
                        questionText: p.questionText,
                        answerType: 'single',
                        answers: p.answers.map((a) => ({
                            id: a.id,
                            text: a.text,
                            isCorrect: false,
                        })),
                        timeLimit: p.timeLimit,
                        points: 100,
                    };
                    this.status = 'active';
                    this.participantAnswered = Object.fromEntries(
                        this.participants.map((participant) => [participant.id, false]),
                    );
                    this.startTimer();
                    break;
                }
                case 'PAUSED':
                    this.status = 'paused';
                    this.stopTimer();
                    break;
                case 'RESUMED':
                    this.status = 'active';
                    this.startTimer();
                    break;
                case 'ENDED':
                    this.status = 'ended';
                    this.stopTimer();
                    this.disconnect();
                    break;
            }
        });
    }

    async createSession(quizId: string): Promise<string | null> {
        this.isLoading = true;
        this.error = null;
        try {
            const res = await apiCreateSession({ quizId }, { hostId: this.hostId });
            runInAction(() => {
                this.roomCode = res.data.roomCode;
                this.sessionId = res.data.id;
                this.status = 'waiting';
            });
            return res.data.roomCode;
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Failed to create session';
            });
            return null;
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async startSession(): Promise<void> {
        if (!this.roomCode) {
            return;
        }
        try {
            await apiStartSession(this.roomCode, { hostId: this.hostId });
            this.connect(this.roomCode);
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Failed to start session';
            });
        }
    }

    async nextQuestion(): Promise<void> {
        if (!this.roomCode) {
            return;
        }
        await apiNextQuestion(this.roomCode, { hostId: this.hostId });
    }

    async endSession(): Promise<void> {
        if (!this.roomCode) {
            return;
        }
        try {
            await apiEndSession(this.roomCode, { hostId: this.hostId });
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Failed to end session';
            });
        }
    }

    async joinSession(roomCode: string, nickname: string): Promise<void> {
        this.isLoading = true;
        this.error = null;
        try {
            const res = await apiJoinSession(roomCode, { nickname });
            runInAction(() => {
                this.roomCode = roomCode;
                this.participantId = res.data.participantId;
            });
            this.connect(roomCode);
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Failed to join session';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
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
            const res = await apiSubmitAnswer(this.roomCode, {
                participantId: this.participantId,
                questionId,
                answerIds,
            });
            return res.data;
        } catch {
            return null;
        }
    }

    async fetchLeaderboard(): Promise<void> {
        if (!this.roomCode) {
            return;
        }
        try {
            const res = await apiGetLeaderboard(this.roomCode);
            runInAction(() => {
                this.leaderboard = res.data;
            });
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : 'Failed to fetch leaderboard';
            });
        }
    }

    reset(): void {
        this.disconnect();
        this.stopTimer();
        this.roomCode = null;
        this.sessionId = null;
        this.participantId = null;
        this.status = 'waiting';
        this.currentQuestionIndex = 0;
        this.totalQuestions = 0;
        this.timeLeft = 30;
        this.currentQuestion = null;
        this.participants = [];
        this.answerStats = {};
        this.participantAnswered = {};
        this.leaderboard = [];
        this.error = null;
    }
}
