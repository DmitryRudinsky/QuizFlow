import { useStore } from '@app/providers/StoreProvider';
import { useTranslation } from '@shared/lib/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/Table';
import { observer } from 'mobx-react-lite';

import styles from './ParticipantAccountPage.module.scss';

const mockStats = {
    totalQuizzes: 24,
    avgScore: 76,
    totalPoints: 18450,
    bestRank: 1,
};

const mockHistory = [
    {
        id: '1',
        quizTitle: 'JavaScript Fundamentals',
        date: 'Apr 5, 2026',
        score: 1200,
        total: 1500,
        rank: 5,
        participants: 42,
    },
    {
        id: '2',
        quizTitle: 'React Hooks Deep Dive',
        date: 'Apr 3, 2026',
        score: 1650,
        total: 2000,
        rank: 3,
        participants: 38,
    },
    {
        id: '3',
        quizTitle: 'CSS Grid & Flexbox',
        date: 'Apr 1, 2026',
        score: 900,
        total: 1200,
        rank: 12,
        participants: 29,
    },
    {
        id: '4',
        quizTitle: 'TypeScript Basics',
        date: 'Mar 30, 2026',
        score: 1500,
        total: 1800,
        rank: 8,
        participants: 55,
    },
];

export const ParticipantAccountPage = observer(function ParticipantAccountPage() {
    const { user, auth } = useStore();
    const { t } = useTranslation();
    const currentUser = user.currentUser;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerContent}>
                        <div>
                            <h1>{t('participantAccount.title')}</h1>
                            <p className={styles.headerTitle}>{t('participantAccount.subtitle')}</p>
                        </div>
                        <div className={styles.headerActions}>
                            <LanguageSwitcher />
                            <button className={styles.logoutButton} onClick={() => auth.logout()}>
                                {t('common.logOut')}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.body}>
                <Card>
                    <CardContent className={styles.cardContentPadded}>
                        <div className={styles.profileCard}>
                            <div className={styles.avatar}>
                                <span className={styles.avatarInitial}>
                                    {currentUser?.name?.charAt(0).toUpperCase() ?? 'JD'}
                                </span>
                            </div>
                            <div>
                                <div className={styles.profileName}>
                                    {currentUser?.name ?? 'John Doe'}
                                </div>
                                <div className={styles.profileEmail}>
                                    {currentUser?.email ?? 'john@example.com'}
                                </div>
                                <div>
                                    <span className={styles.roleBadge}>
                                        {t('participantAccount.role')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className={styles.statsGrid}>
                    <Card>
                        <CardContent className={styles.cardContentPadded}>
                            <div className={styles.statLabel}>
                                {t('participantAccount.quizzesPlayed')}
                            </div>
                            <div className={styles.statValue}>{mockStats.totalQuizzes}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className={styles.cardContentPadded}>
                            <div className={styles.statLabel}>
                                {t('participantAccount.avgScore')}
                            </div>
                            <div className={styles.statValue}>{mockStats.avgScore}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className={styles.cardContentPadded}>
                            <div className={styles.statLabel}>
                                {t('participantAccount.totalPoints')}
                            </div>
                            <div className={styles.statValue}>
                                {mockStats.totalPoints.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className={styles.cardContentPadded}>
                            <div className={styles.statLabel}>
                                {t('participantAccount.bestRank')}
                            </div>
                            <div className={styles.statValue}>#{mockStats.bestRank}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('participantAccount.history')}</CardTitle>
                        <CardDescription>{t('participantAccount.historySubtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('participantAccount.colTitle')}</TableHead>
                                    <TableHead>{t('participantAccount.colDate')}</TableHead>
                                    <TableHead>{t('participantAccount.colScore')}</TableHead>
                                    <TableHead>{t('participantAccount.colRank')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockHistory.map((quiz) => (
                                    <TableRow key={quiz.id}>
                                        <TableCell className={styles.cellBold}>
                                            {quiz.quizTitle}
                                        </TableCell>
                                        <TableCell className={styles.cellMuted}>
                                            {quiz.date}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className={styles.scoreMain}>
                                                    {quiz.score} / {quiz.total}
                                                </div>
                                                <div className={styles.scorePercent}>
                                                    {Math.round((quiz.score / quiz.total) * 100)}%
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    quiz.rank <= 3
                                                        ? styles.rankBadgeTop
                                                        : styles.rankBadgeNormal
                                                }
                                            >
                                                #{quiz.rank} of {quiz.participants}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});
