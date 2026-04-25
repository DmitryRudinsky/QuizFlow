import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';
import { ArrowLeft, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import styles from './ForgotPasswordPage.module.scss';

export const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.logoRow}>
                    <div className={styles.logoIcon}>
                        <Zap />
                    </div>
                    <span className={styles.logoName}>{t('common.appName')}</span>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('forgotPassword.title')}</CardTitle>
                        <CardDescription>{t('forgotPassword.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                            <div className={styles.fieldGroup}>
                                <Label htmlFor='email'>{t('forgotPassword.email')}</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    placeholder={t('forgotPassword.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <Button type='submit' className={styles.fullWidthButton} disabled>
                                {t('forgotPassword.submit')}
                            </Button>

                            <Link to={ROUTES.LOGIN} className={styles.backLink}>
                                <ArrowLeft />
                                {t('forgotPassword.backToLogin')}
                            </Link>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
