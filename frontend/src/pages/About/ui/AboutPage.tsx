import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/Card';
import { CheckCircle, Home, Zap } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router';

import styles from './AboutPage.module.scss';

export const AboutPage = observer(function AboutPage() {
    const { t } = useTranslation();

    const features = [
        t('about.feature1'),
        t('about.feature2'),
        t('about.feature3'),
        t('about.feature4'),
    ];

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.logoRow}>
                    <div className={styles.logoIcon}>
                        <Zap />
                    </div>
                    <span className={styles.logoName}>{t('common.appName')}</span>
                </div>

                <div className={styles.header}>
                    <h1 className={styles.title}>{t('about.title')}</h1>
                    <p className={styles.subtitle}>{t('about.subtitle')}</p>
                </div>

                <div className={styles.cards}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('about.missionTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={styles.text}>{t('about.missionText')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('about.featuresTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className={styles.featureList}>
                                {features.map((feature, i) => (
                                    <li key={i} className={styles.featureItem}>
                                        <CheckCircle />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <Link to={ROUTES.LANDING}>
                    <Button variant='outline'>
                        <Home />
                        {t('about.backHome')}
                    </Button>
                </Link>
            </div>
        </div>
    );
});
