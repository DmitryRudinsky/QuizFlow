export interface Participant {
    id: string;
    name: string;
    score: number;
    answers: Record<string, string[]>;
    joinedAt: string;
}

export interface LiveQuizSession {
    roomCode: string;
    quizId: string;
    participants: Participant[];
    currentQuestionIndex: number;
    status: 'waiting' | 'active' | 'paused' | 'ended';
    startedAt?: string;
}
