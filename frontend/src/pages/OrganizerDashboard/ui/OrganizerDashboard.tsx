import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@shared/ui/DropdownMenu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/Table';
import { OrganizerSidebar } from '@widgets/OrganizerSidebar/ui/OrganizerSidebar';
import { Edit, MoreVertical, Play, Plus, Trash2 } from 'lucide-react';
import { when } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link } from 'react-router';

import styles from './OrganizerDashboard.module.scss';

export const OrganizerDashboard = observer(() => {
    const { quiz, user } = useStore();
    const { t } = useTranslation();

    useEffect(() => {
        return when(
            () => Boolean(user.currentUser),
            () => {
                void quiz.fetchByUser();
            },
        );
    }, [quiz, user]);

    return (
        <div className={styles.layout}>
            <OrganizerSidebar />

            <main className={styles.main}>
                <div className={styles.body}>
                    <div className={styles.topRow}>
                        <div>
                            <h1>{t('dashboard.title')}</h1>
                            <p className={styles.topSubtitle}>{t('dashboard.subtitle')}</p>
                        </div>
                        <Link to={ROUTES.ORGANIZER_QUIZ_NEW}>
                            <Button>
                                <Plus />
                                {t('dashboard.createNew')}
                            </Button>
                        </Link>
                    </div>

                    <div className={styles.statsGrid}>
                        <StatCard
                            title={t('dashboard.totalQuizzes')}
                            value='24'
                            change={t('dashboard.thisWeek')}
                            colorClass={styles.statChangePrimary}
                        />
                        <StatCard
                            title={t('dashboard.totalParticipants')}
                            value='1,284'
                            change={t('dashboard.vsLastWeek')}
                            colorClass={styles.statChangeTeal}
                        />
                        <StatCard
                            title={t('dashboard.activeSessions')}
                            value='3'
                            change={t('dashboard.liveNow')}
                            colorClass={styles.statChangeSuccess}
                        />
                        <StatCard
                            title={t('dashboard.avgCompletion')}
                            value='87%'
                            change={t('dashboard.improvement')}
                            colorClass={styles.statChangePink}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <div className={styles.cardHeaderRow}>
                                <div>
                                    <CardTitle>{t('dashboard.recentQuizzes')}</CardTitle>
                                    <CardDescription>
                                        {t('dashboard.recentSubtitle')}
                                    </CardDescription>
                                </div>
                                {quiz.quizList.length > 10 && (
                                    <Link to={ROUTES.ORGANIZER_QUIZZES} className={styles.viewAll}>
                                        {t('dashboard.viewAll')}
                                    </Link>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('dashboard.colTitle')}</TableHead>
                                        <TableHead>{t('dashboard.colQuestions')}</TableHead>
                                        <TableHead>{t('dashboard.colParticipants')}</TableHead>
                                        <TableHead>{t('dashboard.colLastUsed')}</TableHead>
                                        <TableHead>{t('dashboard.colStatus')}</TableHead>
                                        <TableHead className={styles.colNarrow}></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quiz.quizList.slice(0, 10).map((q) => (
                                        <TableRow key={q.id}>
                                            <TableCell className={styles.cellBold}>
                                                {q.title}
                                            </TableCell>
                                            <TableCell>
                                                {q.questionCount ?? q.questions.length}
                                            </TableCell>
                                            <TableCell>—</TableCell>
                                            <TableCell className={styles.cellMuted}>—</TableCell>
                                            <TableCell>
                                                <span className={styles.statusBadgeActive}>
                                                    active
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            className={styles.dropdownButton}
                                                            variant='ghost'
                                                            size='icon'
                                                        >
                                                            <MoreVertical />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end'>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                to={ROUTES.ORGANIZER_QUIZ_SETTINGS(
                                                                    q.id,
                                                                )}
                                                            >
                                                                <Play />
                                                                {t('dashboard.startQuiz')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                to={ROUTES.ORGANIZER_QUIZ_EDIT(
                                                                    q.id,
                                                                )}
                                                            >
                                                                <Edit />
                                                                {t('common.edit')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={styles.itemDestructive}
                                                            onClick={() => quiz.deleteQuiz(q.id)}
                                                        >
                                                            <Trash2 />
                                                            {t('common.delete')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
});

function StatCard({
    title,
    value,
    change,
    colorClass,
}: {
    title: string;
    value: string;
    change: string;
    colorClass: string;
}) {
    return (
        <Card>
            <CardContent className={styles.cardContentPadded}>
                <div className={styles.statInner}>
                    <p className={styles.statTitle}>{title}</p>
                    <p className={styles.statValue}>{value}</p>
                    <p className={colorClass}>{change}</p>
                </div>
            </CardContent>
        </Card>
    );
}
