import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { Zap } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import styles from './LoginPage.module.scss';

export const LoginPage = observer(() => {
    const { auth } = useStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await auth.login(email, password);
        const role =
            email.includes('organizer') || email.includes('host') ? 'organizer' : 'participant';
        navigate(role === 'organizer' ? ROUTES.ORGANIZER_DASHBOARD : ROUTES.PARTICIPANT_JOIN);
    };

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
                    <CardHeader>
                        <CardTitle>{t('login.title')}</CardTitle>
                        <CardDescription>{t('login.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.fieldGroup}>
                                <Label htmlFor='email'>{t('login.email')}</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    placeholder={t('login.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <div className={styles.passwordLabelRow}>
                                    <Label htmlFor='password'>{t('login.password')}</Label>
                                    <Link to={ROUTES.FORGOT_PASSWORD} className={styles.forgotLink}>
                                        {t('login.forgotPassword')}
                                    </Link>
                                </div>
                                <Input
                                    id='password'
                                    type='password'
                                    placeholder={t('login.passwordPlaceholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type='submit'
                                className={styles.fullWidthButton}
                                disabled={auth.isLoading}
                            >
                                {auth.isLoading ? t('login.submitting') : t('login.submit')}
                            </Button>

                            <p className={styles.footerText}>
                                {t('login.noAccount')}{' '}
                                <Link to={ROUTES.SIGNUP} className={styles.signUpLink}>
                                    {t('login.signUp')}
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});
