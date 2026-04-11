import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Home } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router';

import styles from './NotFoundPage.module.scss';

export const NotFoundPage = observer(() => {
    const { t } = useTranslation();
    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.errorCode}>{t('notFound.code')}</h1>
                    <h2 className={styles.subtitle}>{t('notFound.title')}</h2>
                    <p className={styles.description}>{t('notFound.description')}</p>
                </div>
                <Link to={ROUTES.LANDING}>
                    <Button className={styles.backButton}>
                        <Home />
                        {t('notFound.backHome')}
                    </Button>
                </Link>
            </div>
        </div>
    );
});
