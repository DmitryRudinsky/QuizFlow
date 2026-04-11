import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';
import { ArrowLeft, CheckCircle, Zap } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Link } from 'react-router';

import styles from './ForgotPasswordPage.module.scss';

export const ForgotPasswordPage = observer(function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsLoading(false);
        setSubmitted(true);
    };

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
                    {submitted ? (
                        <>
                            <CardHeader>
                                <div className={styles.successIcon}>
                                    <CheckCircle />
                                </div>
                                <CardTitle>{t('forgotPassword.successTitle')}</CardTitle>
                                <CardDescription>
                                    {t('forgotPassword.successDesc', { email })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link to={ROUTES.LOGIN}>
                                    <Button variant='outline' className={styles.fullWidthButton}>
                                        <ArrowLeft />
                                        {t('forgotPassword.backToLogin')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </>
                    ) : (
                        <>
                            <CardHeader>
                                <CardTitle>{t('forgotPassword.title')}</CardTitle>
                                <CardDescription>{t('forgotPassword.subtitle')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.fieldGroup}>
                                        <Label htmlFor='email'>{t('forgotPassword.email')}</Label>
                                        <Input
                                            id='email'
                                            type='email'
                                            placeholder={t('forgotPassword.emailPlaceholder')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <Button
                                        type='submit'
                                        className={styles.fullWidthButton}
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? t('forgotPassword.submitting')
                                            : t('forgotPassword.submit')}
                                    </Button>

                                    <Link to={ROUTES.LOGIN} className={styles.backLink}>
                                        <ArrowLeft />
                                        {t('forgotPassword.backToLogin')}
                                    </Link>
                                </form>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
});
