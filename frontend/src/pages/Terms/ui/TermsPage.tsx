import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/Card';
import { Home, Zap } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router';

import styles from './TermsPage.module.scss';

export const TermsPage = observer(function TermsPage() {
    const { t } = useTranslation();

    const sections = [
        { title: t('terms.section1Title'), text: t('terms.section1Text') },
        { title: t('terms.section2Title'), text: t('terms.section2Text') },
        { title: t('terms.section3Title'), text: t('terms.section3Text') },
        { title: t('terms.section4Title'), text: t('terms.section4Text') },
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
                    <h1 className={styles.title}>{t('terms.title')}</h1>
                    <p className={styles.subtitle}>{t('terms.subtitle')}</p>
                </div>

                <div className={styles.sections}>
                    {sections.map((section, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className={styles.sectionTitle}>
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className={styles.text}>{section.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Link to={ROUTES.LANDING}>
                    <Button variant='outline'>
                        <Home />
                        {t('terms.backHome')}
                    </Button>
                </Link>
            </div>
        </div>
    );
});
