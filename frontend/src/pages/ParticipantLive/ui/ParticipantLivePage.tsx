import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { CountdownTimer } from '@widgets/CountdownTimer/ui/CountdownTimer';
import { Check, Clock, Loader2 } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import styles from './ParticipantLivePage.module.scss';

type AnswerState = 'default' | 'selected' | 'submitted' | 'correct' | 'incorrect' | 'expired';

export const ParticipantLivePage = observer(() => {
    const { roomCode } = useParams();
    const { session } = useStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [answerState, setAnswerState] = useState<AnswerState>('default');
    const [lastPoints, setLastPoints] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);

    useEffect(() => {
        if (roomCode) {
            session.connect(roomCode);
        }
        return () => {
            session.stopTimer();
        };
    }, [session, roomCode]);

    // Navigate to results when session ends
    useEffect(() => {
        if (session.status === 'ended' && roomCode) {
            navigate(ROUTES.PARTICIPANT_RESULTS(roomCode));
        }
    }, [session.status, roomCode, navigate]);

    // Reset answer state when a new question arrives
    const currentQuestion = session.currentQuestion;
    useEffect(() => {
        setSelectedAnswers([]);
        setAnswerState('default');
        setIsWaiting(false);
    }, [currentQuestion?.id]);

    // Sync timeLeft expiry — only when a question is active
    useEffect(() => {
        if (currentQuestion && session.timeLeft <= 0 && answerState === 'default') {
            setAnswerState('expired');
        }
    }, [session.timeLeft, answerState, currentQuestion]);

    const handleAnswerClick = (answerId: string) => {
        if (answerState === 'submitted' || answerState === 'expired') {
            return;
        }
        setSelectedAnswers([answerId]);
        setAnswerState('selected');
    };

    const handleSubmit = async () => {
        if (selectedAnswers.length === 0 || !currentQuestion) {
            return;
        }
        setAnswerState('submitted');
        const result = await session.submitAnswer(currentQuestion.id, selectedAnswers);
        if (result) {
            setLastPoints(result.pointsEarned);
            setAnswerState(result.isCorrect ? 'correct' : 'incorrect');
        } else {
            setAnswerState('incorrect');
        }
        setTimeout(() => setIsWaiting(true), 2000);
    };

    if (!currentQuestion || session.status === 'waiting') {
        return (
            <div className={styles.waitingPage}>
                <Card className={styles.waitingCard}>
                    <Loader2 className={`${styles.waitingSpinner} ${styles.spin}`} />
                    <h2 className={styles.waitingTitle}>{t('participantLive.waiting')}</h2>
                    <p className={styles.waitingSubtitle}>{t('participantLive.waitingHint')}</p>
                </Card>
            </div>
        );
    }

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
                            {session.currentQuestionIndex + 1} / {session.totalQuestions}
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
                                current: session.currentQuestionIndex + 1,
                                total: session.totalQuestions,
                            })}
                        </div>
                    </div>
                    <CountdownTimer
                        timeLeft={session.timeLeft}
                        totalTime={currentQuestion.timeLimit}
                        size='small'
                    />
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.mainInner}>
                    <Card className={styles.questionCard}>
                        <div className={styles.questionPad}>
                            <div className={styles.questionLabel}>
                                {t('participantLive.question', {
                                    current: session.currentQuestionIndex + 1,
                                })}
                            </div>
                            <h2 className={styles.questionText}>{currentQuestion.questionText}</h2>

                            <div className={styles.answersGrid}>
                                {currentQuestion.answers.map((answer) => {
                                    const isSelected = selectedAnswers.includes(answer.id);

                                    let buttonClass = styles.answerButton;
                                    if (showResult) {
                                        if (isSelected && answerState === 'correct') {
                                            buttonClass = `${styles.answerButton} ${styles.answerButtonCorrect}`;
                                        } else if (isSelected && answerState === 'incorrect') {
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
                                                {isSelected && !showResult && (
                                                    <div className={styles.answerSelectedDot}>
                                                        <Check />
                                                    </div>
                                                )}
                                                {showResult &&
                                                    isSelected &&
                                                    answerState === 'correct' && (
                                                        <Check className={styles.answerCheckIcon} />
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
                                        {t('participantLive.correct', { points: lastPoints })}
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
