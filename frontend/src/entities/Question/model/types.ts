export interface Answer {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    type: 'text' | 'image';
    questionText: string;
    imageUrl?: string;
    answerType: 'single' | 'multiple';
    answers: Answer[];
    timeLimit: number;
    points: number;
}
