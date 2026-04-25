import type { RootStore } from '@app/model/rootStore';
import type { Answer, Question } from '@entities/Question/model/types';
import type { QuizSettings } from '@entities/Quiz/model/types';
import {
    addQuestion as addQuestionApi,
    createQuiz,
    updateQuiz as updateQuizApi,
} from '@shared/api/generated';
import { makeAutoObservable } from 'mobx';

const DEFAULT_SETTINGS: QuizSettings = {
    timePerQuestion: 30,
    scoringMode: 'standard',
    allowAnswerChanges: false,
    randomizeQuestions: false,
    showCorrectAnswers: 'after-each',
};

export class QuizBuilderStore {
    quizId: string | null = null;
    quizTitle = '';
    description = '';
    category = '';
    questions: Question[] = [];
    selectedQuestionId: string | null = null;
    settings: QuizSettings = { ...DEFAULT_SETTINGS };
    private root: RootStore;

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this);
    }

    get currentQuestion(): Question | undefined {
        return this.questions.find((q) => q.id === this.selectedQuestionId);
    }

    get isEmpty(): boolean {
        return this.questions.length === 0;
    }

    loadForEdit(quizId: string): void {
        const quiz = this.root.quiz.getById(quizId);
        if (!quiz) {
            return;
        }
        this.quizId = quizId;
        this.quizTitle = quiz.title;
        this.description = quiz.description;
        this.category = quiz.category;
        this.questions = quiz.questions.map((q) => ({ ...q, answers: [...q.answers] }));
        this.settings = { ...quiz.settings };
        this.selectedQuestionId = null;
    }

    reset(): void {
        this.quizId = null;
        this.quizTitle = '';
        this.description = '';
        this.category = '';
        this.questions = [];
        this.selectedQuestionId = null;
        this.settings = { ...DEFAULT_SETTINGS };
    }

    setTitle(title: string): void {
        this.quizTitle = title;
    }

    setDescription(description: string): void {
        this.description = description;
    }

    setCategory(category: string): void {
        this.category = category;
    }

    updateSettings(updates: Partial<QuizSettings>): void {
        this.settings = { ...this.settings, ...updates };
    }

    selectQuestion(id: string | null): void {
        this.selectedQuestionId = id;
    }

    addQuestion(): void {
        const newQuestion: Question = {
            id: Date.now().toString(),
            type: 'text',
            questionText: '',
            answerType: 'single',
            answers: [
                { id: 'a1', text: '', isCorrect: false },
                { id: 'a2', text: '', isCorrect: false },
            ],
            timeLimit: 30,
            points: 100,
        };
        this.questions.push(newQuestion);
        this.selectedQuestionId = newQuestion.id;
    }

    deleteQuestion(id: string): void {
        this.questions = this.questions.filter((q) => q.id !== id);
        if (this.selectedQuestionId === id) {
            this.selectedQuestionId = null;
        }
    }

    updateQuestion(id: string, updates: Partial<Question>): void {
        const index = this.questions.findIndex((q) => q.id === id);
        if (index !== -1) {
            this.questions[index] = { ...this.questions[index], ...updates };
        }
    }

    addAnswer(questionId: string): void {
        const question = this.questions.find((q) => q.id === questionId);
        if (!question) {
            return;
        }
        const newAnswer: Answer = {
            id: `a${Date.now()}`,
            text: '',
            isCorrect: false,
        };
        this.updateQuestion(questionId, {
            answers: [...question.answers, newAnswer],
        });
    }

    updateAnswer(questionId: string, answerId: string, updates: Partial<Answer>): void {
        const question = this.questions.find((q) => q.id === questionId);
        if (!question) {
            return;
        }
        const isSingleAndMarkingCorrect =
            question.answerType === 'single' && updates.isCorrect === true;
        this.updateQuestion(questionId, {
            answers: question.answers.map((a) => {
                if (a.id === answerId) {
                    return { ...a, ...updates };
                }
                if (isSingleAndMarkingCorrect) {
                    return { ...a, isCorrect: false };
                }
                return a;
            }),
        });
    }

    deleteAnswer(questionId: string, answerId: string): void {
        const question = this.questions.find((q) => q.id === questionId);
        if (!question || question.answers.length <= 2) {
            return;
        }
        this.updateQuestion(questionId, {
            answers: question.answers.filter((a) => a.id !== answerId),
        });
    }

    async save(): Promise<boolean> {
        if (!this.quizTitle || this.questions.length === 0) {
            return false;
        }

        try {
            let quizId = this.quizId;

            if (!quizId) {
                const res = await createQuiz({
                    title: this.quizTitle,
                    description: this.description || undefined,
                    category: this.category || undefined,
                });
                quizId = res.data.id;
            } else {
                await updateQuizApi(quizId, {
                    title: this.quizTitle,
                    description: this.description || undefined,
                    category: this.category || undefined,
                });
            }

            const newQuestions = this.questions.filter((q) => !q.id.includes('-'));
            for (const question of newQuestions) {
                await addQuestionApi(quizId, {
                    questionText: question.questionText,
                    type: question.type,
                    answerType: question.answerType,
                    timeLimit: question.timeLimit,
                    points: question.points,
                    answers: question.answers.map((a) => ({
                        text: a.text,
                        isCorrect: a.isCorrect,
                    })),
                });
            }

            await this.root.quiz.fetchById(quizId);
            return true;
        } catch {
            return false;
        }
    }
}
