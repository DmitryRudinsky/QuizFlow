import { JoinForm } from '@features/JoinQuiz/ui/JoinForm';
import { useTranslation } from '@shared/lib/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { Users, Zap } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import styles from './ParticipantJoinPage.module.scss';

export const ParticipantJoinPage = observer(() => {
    const { t } = useTranslation();
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.logoRow}>
                    <div className={styles.logoIcon}>
                        <Zap />
                    </div>
                    <span className={styles.logoName}>{t('common.appName')}</span>
                    <div className={styles.langSwitcher}>
                        <LanguageSwitcher />
                    </div>
                </div>

                <Card>
                    <CardHeader className={styles.cardHeaderCentered}>
                        <div className={styles.cardHeaderIcon}>
                            <Users />
                        </div>
                        <CardTitle>{t('participantJoin.title')}</CardTitle>
                        <CardDescription>{t('participantJoin.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <JoinForm />
                    </CardContent>
                </Card>

                <div className={styles.hint}>
                    <p className={styles.hintText}>{t('participantJoin.hint')}</p>
                </div>
            </div>
        </div>
    );
});
