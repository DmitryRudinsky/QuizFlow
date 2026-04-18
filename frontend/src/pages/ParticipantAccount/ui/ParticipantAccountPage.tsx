import { useStore } from '@app/providers/useStore';
import { useTranslation } from '@shared/lib/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/Table';
import { observer } from 'mobx-react-lite';

import styles from './ParticipantAccountPage.module.scss';

export const ParticipantAccountPage = observer(() => {
    const { user, auth } = useStore();
    const { t } = useTranslation();
    const currentUser = user.currentUser;
    const history = user.quizHistory;

    const totalPoints = history.reduce((sum, h) => sum + h.score, 0);
    const bestRank = history.length > 0 ? Math.min(...history.map((h) => h.rank)) : null;

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
                            <div className={styles.statValue}>{history.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className={styles.cardContentPadded}>
                            <div className={styles.statLabel}>
                                {t('participantAccount.avgScore')}
                            </div>
                            <div className={styles.statValue}>—</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className={styles.cardContentPadded}>
                            <div className={styles.statLabel}>
                                {t('participantAccount.totalPoints')}
                            </div>
                            <div className={styles.statValue}>{totalPoints.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className={styles.cardContentPadded}>
                            <div className={styles.statLabel}>
                                {t('participantAccount.bestRank')}
                            </div>
                            <div className={styles.statValue}>
                                {bestRank !== null ? `#${bestRank}` : '—'}
                            </div>
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
                                {history.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className={styles.cellBold}>
                                            {entry.quizTitle}
                                        </TableCell>
                                        <TableCell className={styles.cellMuted}>
                                            {entry.date}
                                        </TableCell>
                                        <TableCell>
                                            <div className={styles.scoreMain}>
                                                {entry.score} pts
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    entry.rank <= 3
                                                        ? styles.rankBadgeTop
                                                        : styles.rankBadgeNormal
                                                }
                                            >
                                                #{entry.rank} of {entry.totalParticipants}
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
