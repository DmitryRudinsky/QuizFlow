import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Progress } from '@shared/ui/Progress';
import { AnswerStatsBar } from '@widgets/AnswerStats/ui/AnswerStatsBar';
import { CountdownTimer } from '@widgets/CountdownTimer/ui/CountdownTimer';
import { Loader2, Pause, Play, SkipForward, Users, X } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';

import styles from './LiveHostPage.module.scss';

export const LiveHostPage = observer(() => {
    const navigate = useNavigate();
    const { id: roomCode } = useParams();
    const { session } = useStore();
    const { t } = useTranslation();
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (roomCode) {
            session.connect(roomCode);
        }
        return () => {
            session.stopTimer();
        };
    }, [session, roomCode]);

    // Navigate to results when SESSION_ENDED arrives via WebSocket
    useEffect(() => {
        if (session.status === 'ended' && roomCode) {
            navigate(ROUTES.PARTICIPANT_RESULTS(roomCode));
        }
    }, [session.status, roomCode, navigate]);

    // Poll participants while in lobby (no question active yet)
    useEffect(() => {
        if (!session.currentQuestion && session.roomCode) {
            void session.refreshParticipants();
            pollRef.current = setInterval(() => {
                void session.refreshParticipants();
            }, 2000);
        } else {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        }
        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [session, session.currentQuestion, session.roomCode]);

    const handleNextQuestion = async () => {
        await session.sendNextQuestion();
        // Navigation happens via useEffect watching session.status === 'ended'
    };

    const handleEndQuiz = async () => {
        await session.sendEndSession();
        // Navigation happens via useEffect watching session.status === 'ended'
    };

    const { currentQuestion, answerStats, participantAnswered } = session;
    const progress =
        session.totalQuestions > 0
            ? ((session.currentQuestionIndex + 1) / session.totalQuestions) * 100
            : 0;

    // ─── Lobby (no question started yet) ───
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
                        </div>
                        <Button variant='destructive' onClick={handleEndQuiz}>
                            <X />
                            {t('liveHost.endQuiz')}
                        </Button>
                    </div>

                    <div className={styles.lobbyGrid}>
                        <Card className={styles.lobbyJoinCard}>
                            <div className={styles.lobbyJoinInner}>
                                <div className={styles.lobbyJoinLabel}>
                                    {t('liveHost.lobbyJoinAt')}
                                </div>
                                <div className={styles.lobbyJoinUrl}>localhost:5173</div>
                                <div className={styles.lobbyJoinHint}>
                                    {t('liveHost.lobbyEnterCode')}
                                </div>
                                <div className={styles.lobbyRoomCodeBig}>{session.roomCode}</div>
                            </div>
                        </Card>

                        <Card className={styles.lobbyParticipantsCard}>
                            <div className={styles.lobbyParticipantsHeader}>
                                <Users className={styles.lobbyParticipantsIcon} />
                                <span className={styles.lobbyParticipantsTitle}>
                                    {t('liveHost.lobbyParticipants', {
                                        count: session.participantCount,
                                    })}
                                </span>
                                <Loader2 className={styles.lobbySpinner} />
                            </div>
                            <div className={styles.lobbyParticipantsList}>
                                {session.participants.length === 0 ? (
                                    <p className={styles.lobbyNoParticipants}>
                                        {t('liveHost.lobbyWaiting')}
                                    </p>
                                ) : (
                                    session.participants.map((p) => (
                                        <div key={p.id} className={styles.lobbyParticipantItem}>
                                            <div className={styles.lobbyParticipantAvatar}>
                                                {p.name[0]?.toUpperCase()}
                                            </div>
                                            <span>{p.name}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className={styles.controls}>
                        <Button
                            size='lg'
                            onClick={handleNextQuestion}
                            disabled={!session.wsConnected}
                        >
                            {session.wsConnected ? (
                                <Play />
                            ) : (
                                <Loader2 className={styles.lobbySpinner} />
                            )}
                            {session.wsConnected
                                ? t('liveHost.startQuiz')
                                : t('liveHost.connecting')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Active question ───
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
