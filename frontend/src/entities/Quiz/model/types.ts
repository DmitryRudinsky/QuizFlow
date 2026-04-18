import type { Question } from '@entities/Question/model/types';

export interface QuizSettings {
    timePerQuestion: number;
    scoringMode: 'standard' | 'streak' | 'time-bonus';
    allowAnswerChanges: boolean;
    randomizeQuestions: boolean;
    showCorrectAnswers: 'after-each' | 'end-only';
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    category: string;
    coverImage?: string;
    questions: Question[];
    questionCount: number;
    settings: QuizSettings;
    createdBy: string;
    createdAt: string;
}
