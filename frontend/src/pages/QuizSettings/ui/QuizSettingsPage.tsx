import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { Label } from '@shared/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/Select';
import { Switch } from '@shared/ui/Switch';
import { ArrowLeft, Play } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Link, useNavigate, useParams } from 'react-router';

import styles from './QuizSettingsPage.module.scss';

export const QuizSettingsPage = observer(() => {
    const navigate = useNavigate();
    const { id: quizId } = useParams();
    const { quizBuilder } = useStore();
    const { t } = useTranslation();
    const { settings } = quizBuilder;

    const handleStartQuiz = () => {
        navigate(ROUTES.ORGANIZER_QUIZ_LIVE(quizId || 'new'));
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerLeft}>
                        <Link to={ROUTES.ORGANIZER_DASHBOARD}>
                            <Button variant='ghost' size='icon'>
                                <ArrowLeft />
                            </Button>
                        </Link>
                        <div>
                            <h2>{t('quizSettings.title')}</h2>
                            <p className={styles.headerSubtitle}>{t('quizSettings.subtitle')}</p>
                        </div>
                    </div>
                    <Button onClick={handleStartQuiz}>
                        <Play />
                        {t('quizSettings.startSession')}
                    </Button>
                </div>
            </header>

            <div className={styles.body}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('quizSettings.general')}</CardTitle>
                        <CardDescription>{t('quizSettings.generalSubtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.settingGroup}>
                            <Label>{t('quizSettings.timePerQuestion')}</Label>
                            <Select
                                value={settings.timePerQuestion.toString()}
                                onValueChange={(value) =>
                                    quizBuilder.updateSettings({ timePerQuestion: parseInt(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='15'>{t('quizSettings.time15')}</SelectItem>
                                    <SelectItem value='30'>{t('quizSettings.time30')}</SelectItem>
                                    <SelectItem value='45'>{t('quizSettings.time45')}</SelectItem>
                                    <SelectItem value='60'>{t('quizSettings.time60')}</SelectItem>
                                    <SelectItem value='90'>{t('quizSettings.time90')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className={styles.settingHint}>{t('quizSettings.timeHint')}</p>
                        </div>

                        <div className={styles.settingGroup}>
                            <Label>{t('quizSettings.scoringMode')}</Label>
                            <Select
                                value={settings.scoringMode}
                                onValueChange={(value) =>
                                    quizBuilder.updateSettings({
                                        scoringMode: value as 'standard' | 'streak' | 'time-bonus',
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='standard'>
                                        {t('quizSettings.scoringStandard')}
                                    </SelectItem>
                                    <SelectItem value='streak'>
                                        {t('quizSettings.scoringStreak')}
                                    </SelectItem>
                                    <SelectItem value='time-bonus'>
                                        {t('quizSettings.scoringTime')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className={styles.settingHint}>{t('quizSettings.scoringHint')}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('quizSettings.behavior')}</CardTitle>
                        <CardDescription>{t('quizSettings.behaviorSubtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.toggleRow}>
                            <div className={styles.toggleInfo}>
                                <Label>{t('quizSettings.allowChanges')}</Label>
                                <p className={styles.toggleHint}>
                                    {t('quizSettings.allowChangesHint')}
                                </p>
                            </div>
                            <Switch
                                checked={settings.allowAnswerChanges}
                                onCheckedChange={(checked) =>
                                    quizBuilder.updateSettings({ allowAnswerChanges: checked })
                                }
                            />
                        </div>

                        <div className={styles.toggleRow}>
                            <div className={styles.toggleInfo}>
                                <Label>{t('quizSettings.randomize')}</Label>
                                <p className={styles.toggleHint}>
                                    {t('quizSettings.randomizeHint')}
                                </p>
                            </div>
                            <Switch
                                checked={settings.randomizeQuestions}
                                onCheckedChange={(checked) =>
                                    quizBuilder.updateSettings({ randomizeQuestions: checked })
                                }
                            />
                        </div>

                        <div className={styles.settingGroup}>
                            <Label>{t('quizSettings.showAnswers')}</Label>
                            <Select
                                value={settings.showCorrectAnswers}
                                onValueChange={(value) =>
                                    quizBuilder.updateSettings({
                                        showCorrectAnswers: value as 'after-each' | 'end-only',
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='after-each'>
                                        {t('quizSettings.afterEach')}
                                    </SelectItem>
                                    <SelectItem value='end-only'>
                                        {t('quizSettings.atEnd')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className={styles.settingHint}>
                                {t('quizSettings.showAnswersHint')}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('quizSettings.roomConfig')}</CardTitle>
                        <CardDescription>{t('quizSettings.roomConfigSubtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.roomCodeBox}>
                            <div className={styles.roomCodeRow}>
                                <div>
                                    <Label>{t('quizSettings.roomCode')}</Label>
                                    <p className={styles.roomCode}>
                                        {t('quizSettings.roomCodePlaceholder')}
                                    </p>
                                    <p className={styles.roomCodeHint}>
                                        {t('quizSettings.roomCodeHint')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});
