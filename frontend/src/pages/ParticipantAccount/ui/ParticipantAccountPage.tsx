import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { ConfirmDialog } from '@shared/ui/ConfirmDialog';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/Table';
import { when } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import styles from './ParticipantAccountPage.module.scss';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export const ParticipantAccountPage = observer(() => {
    const { user, auth, session } = useStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const currentUser = user.currentUser;

    useEffect(() => {
        return when(
            () => Boolean(user.currentUser),
            () => {
                void session.fetchParticipantHistory();
            },
        );
    }, [user, session]);

    const history = session.participantHistory;
    const totalPoints = history.reduce((sum, s) => sum + s.score, 0);
    const bestRank = history.length === 0 ? null : Math.min(...history.map((s) => s.rank));

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
                            <button
                                className={styles.logoutButton}
                                onClick={() => setShowLogoutDialog(true)}
                            >
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
                                    <TableRow key={`${entry.id}-${entry.createdAt}`}>
                                        <TableCell className={styles.cellBold}>
                                            {entry.quizTitle}
                                        </TableCell>
                                        <TableCell className={styles.cellMuted}>
                                            {formatDate(entry.createdAt)}
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
                                                #{entry.rank} of {entry.participantCount}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {history.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className={styles.cellMuted}
                                            style={{ textAlign: 'center' }}
                                        >
                                            No quiz history yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {showLogoutDialog && (
                <ConfirmDialog
                    title={t('common.logoutConfirmTitle')}
                    message={t('common.logoutConfirmMessage')}
                    confirmLabel={t('common.confirm')}
                    cancelLabel={t('common.cancel')}
                    onConfirm={() => {
                        auth.logout();
                        navigate(ROUTES.LOGIN);
                    }}
                    onCancel={() => setShowLogoutDialog(false)}
                />
            )}
        </div>
    );
});
