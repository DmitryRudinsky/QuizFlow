import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import confetti from 'canvas-confetti';
import { ArrowRight, Award, Medal, Trophy } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import styles from './ResultsLeaderboard.module.scss';

interface LeaderboardEntry {
    id: string;
    name: string;
    score: number;
    correct: number;
    total: number;
    rank: number;
}

interface ResultsLeaderboardProps {
    entries: LeaderboardEntry[];
}

export const ResultsLeaderboard = observer(function ResultsLeaderboard({
    entries,
}: ResultsLeaderboardProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#6366f1', '#14b8a6', '#ec4899'],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#6366f1', '#14b8a6', '#ec4899'],
            });
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    const rankCircleClass = (index: number) => {
        if (index === 0) {
            return `${styles.rankCircle} ${styles['rankCircle--gold']}`;
        }
        if (index === 1) {
            return `${styles.rankCircle} ${styles['rankCircle--silver']}`;
        }
        if (index === 2) {
            return `${styles.rankCircle} ${styles['rankCircle--bronze']}`;
        }
        return `${styles.rankCircle} ${styles['rankCircle--default']}`;
    };

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <div className={styles.trophyIcon}>
                    <Trophy className={styles.trophyIconSvg} />
                </div>
                <h1 className={styles.headerTitle}>{t('results.title')}</h1>
                <p className={styles.headerSubtitle}>{t('results.subtitle')}</p>
            </div>

            {entries.length >= 3 && (
                <div className={styles.podium}>
                    <div className={styles['podiumCard--second']}>
                        <Card>
                            <div className={styles.podiumCardInner}>
                                <div
                                    className={`${styles.rankBadge} ${styles['rankBadge--second']}`}
                                >
                                    <Medal className={styles.rankBadgeMedal} />
                                </div>
                                <div className={styles.rankLabel}>{t('results.second')}</div>
                                <div className={styles.participantName}>{entries[1].name}</div>
                                <div className={styles.participantScore}>{entries[1].score}</div>
                                <div className={styles.participantCorrect}>
                                    {t('results.correct', {
                                        current: entries[1].correct,
                                        total: entries[1].total,
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div>
                        <Card className={styles.firstPlaceCard}>
                            <div className={styles.podiumCardInner}>
                                <div
                                    className={`${styles.rankBadge} ${styles['rankBadge--first']}`}
                                >
                                    <Trophy className={styles.rankBadgeTrophy} />
                                </div>
                                <div
                                    className={`${styles.rankLabel} ${styles['rankLabel--first']}`}
                                >
                                    {t('results.first')}
                                </div>
                                <div
                                    className={`${styles.participantName} ${styles['participantName--large']}`}
                                >
                                    {entries[0].name}
                                </div>
                                <div
                                    className={`${styles.participantScore} ${styles['participantScore--large']}`}
                                >
                                    {entries[0].score}
                                </div>
                                <div className={styles.participantCorrect}>
                                    {t('results.correct', {
                                        current: entries[0].correct,
                                        total: entries[0].total,
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className={styles['podiumCard--third']}>
                        <Card>
                            <div className={styles.podiumCardInner}>
                                <div
                                    className={`${styles.rankBadge} ${styles['rankBadge--third']}`}
                                >
                                    <Award className={styles.rankBadgeMedal} />
                                </div>
                                <div className={styles.rankLabel}>{t('results.third')}</div>
                                <div className={styles.participantName}>{entries[2].name}</div>
                                <div className={styles.participantScore}>{entries[2].score}</div>
                                <div className={styles.participantCorrect}>
                                    {t('results.correct', {
                                        current: entries[2].correct,
                                        total: entries[2].total,
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            <Card>
                <div className={styles.leaderboardBody}>
                    <h3 className={styles.leaderboardTitle}>{t('results.leaderboard')}</h3>
                    <div className={styles.leaderboardEntries}>
                        {entries.map((participant, index) => (
                            <div
                                key={participant.id}
                                className={`${styles.leaderboardRow} ${
                                    index < 3
                                        ? styles['leaderboardRow--top3']
                                        : styles['leaderboardRow--rest']
                                }`}
                            >
                                <div className={styles.leaderboardEntryLeft}>
                                    <div className={rankCircleClass(index)}>{participant.rank}</div>
                                    <div>
                                        <div className={styles.entryName}>{participant.name}</div>
                                        <div className={styles.entryCorrect}>
                                            {t('results.correct', {
                                                current: participant.correct,
                                                total: participant.total,
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.entryScore}>{participant.score}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <div className={styles.actions}>
                <Button
                    variant='outline'
                    size='lg'
                    onClick={() => navigate(ROUTES.PARTICIPANT_ACCOUNT)}
                >
                    {t('results.viewStats')}
                </Button>
                <Button size='lg' onClick={() => navigate(ROUTES.LANDING)}>
                    {t('results.backHome')}
                    <ArrowRight className={styles.arrowIcon} />
                </Button>
            </div>
        </div>
    );
});
