export type UserRole = 'organizer' | 'participant';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface QuizHistory {
    id: string;
    quizTitle: string;
    date: string;
    score: number;
    totalQuestions: number;
    rank: number;
    totalParticipants: number;
}
