import { useStore } from '@app/providers/useStore';
import { useTranslation } from '@shared/lib/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/Table';
import { OrganizerSidebar } from '@widgets/OrganizerSidebar/ui/OrganizerSidebar';
import { when } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import styles from './OrganizerAccountPage.module.scss';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export const OrganizerAccountPage = observer(() => {
    const { user, quiz, session } = useStore();
    const { t } = useTranslation();
    const currentUser = user.currentUser;

    useEffect(() => {
        return when(
            () => Boolean(user.currentUser),
            () => {
                void quiz.fetchByUser();
                void session.fetchHostedSessions();
            },
        );
    }, [user, quiz, session]);

    const totalParticipants = session.hostSessions.reduce((sum, s) => sum + s.participantCount, 0);
    const avgScore =
        session.hostSessions.length === 0
            ? 0
            : Math.round(
                  session.hostSessions.reduce((sum, s) => sum + s.avgScore, 0) /
                      session.hostSessions.length,
              );

    return (
        <div className={styles.layout}>
            <OrganizerSidebar />

            <main className={styles.main}>
                <div className={styles.body}>
                    <div>
                        <h1>{t('organizerAccount.title')}</h1>
                        <p className={styles.pageSubtitle}>{t('organizerAccount.subtitle')}</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('organizerAccount.profileInfo')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.profileRow}>
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
                                            {t('organizerAccount.role')}
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
                                    {t('organizerAccount.totalQuizzes')}
                                </div>
                                <div className={styles.statValue}>{quiz.quizList.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className={styles.cardContentPadded}>
                                <div className={styles.statLabel}>
                                    {t('organizerAccount.totalParticipants')}
                                </div>
                                <div className={styles.statValue}>
                                    {totalParticipants.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className={styles.cardContentPadded}>
                                <div className={styles.statLabel}>
                                    {t('organizerAccount.sessionsHosted')}
                                </div>
                                <div className={styles.statValue}>
                                    {session.hostSessions.length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className={styles.cardContentPadded}>
                                <div className={styles.statLabel}>
                                    {t('organizerAccount.avgScore')}
                                </div>
                                <div className={styles.statValue}>{avgScore} pts</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('organizerAccount.pastSessions')}</CardTitle>
                            <CardDescription>{t('organizerAccount.pastSubtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('organizerAccount.colTitle')}</TableHead>
                                        <TableHead>{t('organizerAccount.colDate')}</TableHead>
                                        <TableHead>
                                            {t('organizerAccount.colParticipants')}
                                        </TableHead>
                                        <TableHead>{t('organizerAccount.colScore')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {session.hostSessions.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className={styles.cellBold}>
                                                {s.quizTitle}
                                            </TableCell>
                                            <TableCell className={styles.cellMuted}>
                                                {formatDate(s.createdAt)}
                                            </TableCell>
                                            <TableCell>{s.participantCount}</TableCell>
                                            <TableCell>{s.avgScore} pts</TableCell>
                                        </TableRow>
                                    ))}
                                    {session.hostSessions.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className={styles.cellMuted}
                                                style={{ textAlign: 'center' }}
                                            >
                                                No sessions yet
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
});
