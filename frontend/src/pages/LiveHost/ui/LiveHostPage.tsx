import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Progress } from '@shared/ui/Progress';
import { AnswerStatsBar } from '@widgets/AnswerStats/ui/AnswerStatsBar';
import { CountdownTimer } from '@widgets/CountdownTimer/ui/CountdownTimer';
import { Pause, Play, SkipForward, Users, X } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import styles from './LiveHostPage.module.scss';

export const LiveHostPage = observer(() => {
    const navigate = useNavigate();
    const { id: roomCode } = useParams();
    const { session } = useStore();
    const { t } = useTranslation();

    useEffect(() => {
        if (roomCode) {
            session.connect(roomCode);
        }
        return () => {
            session.stopTimer();
        };
    }, [session, roomCode]);

    const handleNextQuestion = async () => {
        await session.sendNextQuestion();
        if (session.isLastQuestion) {
            navigate(ROUTES.PARTICIPANT_RESULTS(roomCode ?? ''));
        }
    };

    const handleEndQuiz = async () => {
        await session.sendEndSession();
        navigate(ROUTES.PARTICIPANT_RESULTS(roomCode ?? ''));
    };

    const { currentQuestion, answerStats, participantAnswered } = session;
    const progress =
        session.totalQuestions > 0
            ? ((session.currentQuestionIndex + 1) / session.totalQuestions) * 100
            : 0;

    if (!currentQuestion) {
        return (
            <div className={styles.page}>
                <div className={styles.inner}>
                    <div className={styles.topBar}>
                        <div className={styles.topBarLeft}>
                            <div className={styles.infoBox}>
                                <div className={styles.infoBoxLabel}>{t('liveHost.roomCode')}</div>
                                <div className={styles.infoBoxValuePrimary}>{session.roomCode}</div>
                            </div>
                            <div className={styles.infoBox}>
                                <div className={styles.infoBoxLabel}>
                                    {t('liveHost.participants')}
                                </div>
                                <div className={styles.infoBoxValueParticipants}>
                                    <Users />
                                    {session.participantCount}
                                </div>
                            </div>
                        </div>
                        <Button variant='destructive' onClick={handleEndQuiz}>
                            <X />
                            {t('liveHost.endQuiz')}
                        </Button>
                    </div>
                    <div className={styles.controls}>
                        <Button size='lg' onClick={handleNextQuestion}>
                            <SkipForward />
                            {t('liveHost.nextQuestion')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <div className={styles.infoBox}>
                            <div className={styles.infoBoxLabel}>{t('liveHost.roomCode')}</div>
                            <div className={styles.infoBoxValuePrimary}>{session.roomCode}</div>
                        </div>
                        <div className={styles.infoBox}>
                            <div className={styles.infoBoxLabel}>{t('liveHost.participants')}</div>
                            <div className={styles.infoBoxValueParticipants}>
                                <Users />
                                {session.participantCount}
                            </div>
                        </div>
                    </div>
                    <Button variant='destructive' onClick={handleEndQuiz}>
                        <X />
                        {t('liveHost.endQuiz')}
                    </Button>
                </div>

                <div className={styles.progressSection}>
                    <div className={styles.progressLabels}>
                        <span className={styles.progressLabel}>
                            {t('liveHost.questionOf', {
                                current: session.currentQuestionIndex + 1,
                                total: session.totalQuestions,
                            })}
                        </span>
                        <span className={styles.progressLabel}>
                            {Math.round(progress)}
                            {t('liveHost.complete')}
                        </span>
                    </div>
                    <Progress value={progress} className={styles.progressBar} />
                </div>

                <Card className={styles.questionCard}>
                    <div className={styles.questionPad}>
                        <div className={styles.questionTop}>
                            <div className={styles.questionInfo}>
                                <div className={styles.questionLabel}>
                                    {t('liveHost.question', {
                                        current: session.currentQuestionIndex + 1,
                                    })}
                                </div>
                                <h2 className={styles.questionText}>
                                    {currentQuestion.questionText}
                                </h2>
                            </div>
                            <CountdownTimer
                                timeLeft={session.timeLeft}
                                totalTime={currentQuestion.timeLimit}
                            />
                        </div>

                        <div className={styles.answersGrid}>
                            {currentQuestion.answers.map((answer) => (
                                <div
                                    key={answer.id}
                                    className={`${styles.answerItem} ${answer.isCorrect ? styles.answerItemCorrect : ''}`}
                                >
                                    <div className={styles.answerTop}>
                                        <span className={styles.answerText}>{answer.text}</span>
                                        {answer.isCorrect && (
                                            <span className={styles.correctBadge}>
                                                {t('liveHost.correct')}
                                            </span>
                                        )}
                                    </div>
                                    <AnswerStatsBar
                                        percentage={answerStats[answer.id] ?? 0}
                                        count={Math.round(
                                            ((answerStats[answer.id] ?? 0) / 100) *
                                                session.participantCount,
                                        )}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={styles.responsesBox}>
                            <div className={styles.responsesRow}>
                                <span className={styles.responsesLabel}>
                                    {t('liveHost.responses', {
                                        answered: session.answeredCount,
                                        total: session.participantCount,
                                    })}
                                </span>
                                <div className={styles.responseDots}>
                                    {session.participants.slice(0, 10).map((p) => (
                                        <div
                                            key={p.id}
                                            className={
                                                participantAnswered[p.id]
                                                    ? styles.responseDotAnswered
                                                    : styles.responseDotPending
                                            }
                                            title={p.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className={styles.controls}>
                    <Button variant='outline' size='lg' onClick={() => session.togglePause()}>
                        {session.status === 'paused' ? <Play /> : <Pause />}
                        {session.status === 'paused' ? t('liveHost.resume') : t('liveHost.pause')}
                    </Button>
                    <Button size='lg' onClick={handleNextQuestion}>
                        {!session.isLastQuestion ? (
                            <>
                                <SkipForward />
                                {t('liveHost.nextQuestion')}
                            </>
                        ) : (
                            t('liveHost.showResults')
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
});
