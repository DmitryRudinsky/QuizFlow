import { useStore } from '@app/providers/useStore';
import { useTranslation } from '@shared/lib/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@shared/ui/Table';
import { OrganizerSidebar } from '@widgets/OrganizerSidebar/ui/OrganizerSidebar';
import { observer } from 'mobx-react-lite';

import styles from './OrganizerAccountPage.module.scss';

export const OrganizerAccountPage = observer(() => {
    const { user, quiz } = useStore();
    const { t } = useTranslation();
    const currentUser = user.currentUser;

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
                                <div className={styles.statValue}>—</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className={styles.cardContentPadded}>
                                <div className={styles.statLabel}>
                                    {t('organizerAccount.sessionsHosted')}
                                </div>
                                <div className={styles.statValue}>—</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className={styles.cardContentPadded}>
                                <div className={styles.statLabel}>
                                    {t('organizerAccount.avgScore')}
                                </div>
                                <div className={styles.statValue}>—</div>
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
                                <TableBody />
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
});
