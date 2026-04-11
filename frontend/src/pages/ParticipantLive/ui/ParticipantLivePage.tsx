import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { CountdownTimer } from '@widgets/CountdownTimer/ui/CountdownTimer';
import { Check, Clock, Loader2 } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import styles from './ParticipantLivePage.module.scss';

const mockQuestion = {
    id: '1',
    questionText: 'What is the output of: console.log(typeof null)?',
    answers: [
        { id: 'a1', text: 'null' },
        { id: 'a2', text: 'object' },
        { id: 'a3', text: 'undefined' },
        { id: 'a4', text: 'number' },
    ],
    timeLimit: 30,
    correctAnswerId: 'a2',
};

type AnswerState = 'default' | 'selected' | 'submitted' | 'correct' | 'incorrect' | 'expired';

export const ParticipantLivePage = observer(() => {
    const { roomCode } = useParams();
    const { t } = useTranslation();
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [answerState, setAnswerState] = useState<AnswerState>('default');
    const [timeLeft, setTimeLeft] = useState(mockQuestion.timeLimit);
    const [currentQuestion] = useState(1);
    const [totalQuestions] = useState(15);
    const [isWaiting, setIsWaiting] = useState(false);

    useEffect(() => {
        if (answerState === 'default' || answerState === 'selected') {
            if (timeLeft > 0) {
                const timer = setInterval(() => {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            setAnswerState('expired');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                return () => clearInterval(timer);
            }
        }
    }, [timeLeft, answerState]);

    const handleAnswerClick = (answerId: string) => {
        if (answerState === 'submitted' || answerState === 'expired') {
            return;
        }
        setSelectedAnswers([answerId]);
        setAnswerState('selected');
    };

    const handleSubmit = () => {
        if (selectedAnswers.length === 0) {
            return;
        }
        setAnswerState('submitted');
        setTimeout(() => {
            const isCorrect = selectedAnswers.includes(mockQuestion.correctAnswerId);
            setAnswerState(isCorrect ? 'correct' : 'incorrect');
            setTimeout(() => setIsWaiting(true), 2000);
        }, 500);
    };

    if (isWaiting) {
        return (
            <div className={styles.waitingPage}>
                <Card className={styles.waitingCard}>
                    <Loader2 className={`${styles.waitingSpinner} ${styles.spin}`} />
                    <h2 className={styles.waitingTitle}>{t('participantLive.waiting')}</h2>
                    <p className={styles.waitingSubtitle}>{t('participantLive.waitingHint')}</p>
                    <div className={styles.waitingProgress}>
                        <div className={styles.waitingProgressLabel}>
                            {t('participantLive.progress')}
                        </div>
                        <div className={styles.waitingProgressValue}>
                            {currentQuestion} / {totalQuestions}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const showResult = answerState === 'correct' || answerState === 'incorrect';

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div>
                        <div className={styles.headerRoom}>
                            {t('participantLive.room', { code: roomCode ?? '' })}
                        </div>
                        <div className={styles.headerQuestion}>
                            {t('participantLive.questionOf', {
                                current: currentQuestion,
                                total: totalQuestions,
                            })}
                        </div>
                    </div>
                    <CountdownTimer
                        timeLeft={timeLeft}
                        totalTime={mockQuestion.timeLimit}
                        size='small'
                    />
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.mainInner}>
                    <Card className={styles.questionCard}>
                        <div className={styles.questionPad}>
                            <div className={styles.questionLabel}>
                                {t('participantLive.question', { current: currentQuestion })}
                            </div>
                            <h2 className={styles.questionText}>{mockQuestion.questionText}</h2>

                            <div className={styles.answersGrid}>
                                {mockQuestion.answers.map((answer) => {
                                    const isSelected = selectedAnswers.includes(answer.id);
                                    const isCorrect = answer.id === mockQuestion.correctAnswerId;

                                    let buttonClass = styles.answerButton;
                                    if (showResult) {
                                        if (isCorrect) {
                                            buttonClass = `${styles.answerButton} ${styles.answerButtonCorrect}`;
                                        } else if (isSelected && !isCorrect) {
                                            buttonClass = `${styles.answerButton} ${styles.answerButtonIncorrect}`;
                                        }
                                    } else if (isSelected) {
                                        buttonClass = `${styles.answerButton} ${styles.answerButtonSelected}`;
                                    } else if (answerState === 'expired') {
                                        buttonClass = `${styles.answerButton} ${styles.answerButtonExpired}`;
                                    }

                                    return (
                                        <button
                                            key={answer.id}
                                            onClick={() => handleAnswerClick(answer.id)}
                                            disabled={
                                                answerState === 'submitted' ||
                                                answerState === 'expired' ||
                                                showResult
                                            }
                                            className={buttonClass}
                                        >
                                            <div className={styles.answerRow}>
                                                <span className={styles.answerText}>
                                                    {answer.text}
                                                </span>
                                                {showResult && isCorrect && (
                                                    <Check className={styles.answerCheckIcon} />
                                                )}
                                                {isSelected && !showResult && (
                                                    <div className={styles.answerSelectedDot}>
                                                        <Check />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {answerState !== 'expired' && !showResult && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={
                                        selectedAnswers.length === 0 || answerState === 'submitted'
                                    }
                                    className={styles.submitButton}
                                    size='lg'
                                >
                                    {answerState === 'submitted'
                                        ? t('participantLive.submitted')
                                        : t('participantLive.submit')}
                                </Button>
                            )}

                            {answerState === 'expired' && (
                                <div className={styles.expiredBox}>
                                    <Clock className={styles.expiredIcon} />
                                    <p className={styles.expiredText}>
                                        {t('participantLive.timesUp')}
                                    </p>
                                </div>
                            )}

                            {answerState === 'correct' && (
                                <div className={styles.correctBox}>
                                    <Check className={styles.correctIcon} />
                                    <p className={styles.correctText}>
                                        {t('participantLive.correct', { points: 100 })}
                                    </p>
                                </div>
                            )}

                            {answerState === 'incorrect' && (
                                <div className={styles.incorrectBox}>
                                    <p className={styles.incorrectText}>
                                        {t('participantLive.incorrect')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
});
