import { useStore } from '@app/providers/useStore';
import type { UserRole } from '@entities/User/model/types';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { User, Users, Zap } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import styles from './SignUpPage.module.scss';

export const SignUpPage = observer(() => {
    const { auth } = useStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedRole, setSelectedRole] = useState<UserRole>(
        (searchParams.get('role') as UserRole) || 'participant',
    );
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await auth.register(name, email, password, selectedRole);
        navigate(
            selectedRole === 'organizer' ? ROUTES.ORGANIZER_DASHBOARD : ROUTES.PARTICIPANT_JOIN,
        );
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
                        <CardTitle>{t('signup.title')}</CardTitle>
                        <CardDescription>{t('signup.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.roleSection}>
                                <Label>{t('signup.rolePrompt')}</Label>
                                <div className={styles.roleGrid}>
                                    <button
                                        type='button'
                                        onClick={() => setSelectedRole('organizer')}
                                        className={`${styles.roleButton} ${selectedRole === 'organizer' ? styles.roleButtonActive : ''}`}
                                    >
                                        <Users
                                            className={`${styles.roleIcon} ${styles.roleIconOrganizer}`}
                                        />
                                        <div className={styles.roleLabel}>
                                            {t('signup.hostLabel')}
                                        </div>
                                        <div className={styles.roleHint}>{t('signup.hostSub')}</div>
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setSelectedRole('participant')}
                                        className={`${styles.roleButton} ${selectedRole === 'participant' ? styles.roleButtonActive : ''}`}
                                    >
                                        <User
                                            className={`${styles.roleIcon} ${styles.roleIconParticipant}`}
                                        />
                                        <div className={styles.roleLabel}>
                                            {t('signup.playLabel')}
                                        </div>
                                        <div className={styles.roleHint}>{t('signup.playSub')}</div>
                                    </button>
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <Label htmlFor='name'>{t('signup.name')}</Label>
                                <Input
                                    id='name'
                                    placeholder={t('signup.namePlaceholder')}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <Label htmlFor='email'>{t('signup.email')}</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    placeholder={t('signup.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <Label htmlFor='password'>{t('signup.password')}</Label>
                                <Input
                                    id='password'
                                    type='password'
                                    placeholder={t('signup.passwordPlaceholder')}
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
                                {auth.isLoading ? t('signup.submitting') : t('signup.submit')}
                            </Button>

                            <p className={styles.footerText}>
                                {t('signup.hasAccount')}{' '}
                                <Link to={ROUTES.LOGIN} className={styles.loginLink}>
                                    {t('signup.logIn')}
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});
