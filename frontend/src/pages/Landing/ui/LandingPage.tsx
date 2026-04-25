import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { BarChart3, CheckCircle2, Clock, Trophy, Users, Zap } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Link, useNavigate } from 'react-router';

import styles from './LandingPage.module.scss';

export const LandingPage = observer(() => {
    const { t } = useTranslation();
    const { user, auth } = useStore();
    const navigate = useNavigate();

    const dashboardRoute =
        user.currentUser?.role === 'organizer'
            ? ROUTES.ORGANIZER_DASHBOARD
            : ROUTES.PARTICIPANT_ACCOUNT;

    const handleLogout = () => {
        auth.logout();
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <Zap />
                        </div>
                        <span className={styles.logoName}>{t('common.appName')}</span>
                    </div>
                    <div className={styles.headerNav}>
                        <LanguageSwitcher />
                        {user.isAuthenticated ? (
                            <>
                                <Button variant='ghost' onClick={() => navigate(dashboardRoute)}>
                                    {user.currentUser!.name}
                                </Button>
                                <Button variant='outline' onClick={handleLogout}>
                                    {t('common.logOut')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to={ROUTES.LOGIN}>
                                    <Button variant='ghost'>{t('common.logIn')}</Button>
                                </Link>
                                <Link to={ROUTES.SIGNUP}>
                                    <Button>{t('landing.getStarted')}</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroBadge}>
                        <Zap />
                        <span className={styles.heroBadgeText}>{t('landing.badge')}</span>
                    </div>
                    <h1 className={styles.heroTitle}>
                        {t('landing.heroTitle1')}
                        <br />
                        {t('landing.heroTitle2')}
                    </h1>
                    <p className={styles.heroSubtitle}>{t('landing.heroSubtitle')}</p>
                    <div className={styles.heroCta}>
                        <Link to={`${ROUTES.SIGNUP}?role=organizer`}>
                            <Button size='lg'>
                                <Zap />
                                {t('common.createQuiz')}
                            </Button>
                        </Link>
                        <Link to={ROUTES.PARTICIPANT_JOIN}>
                            <Button size='lg' variant='outline'>
                                <Users />
                                {t('common.joinQuiz')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.features}>
                <div className={styles.featuresGrid}>
                    <FeatureCard
                        icon={<Clock />}
                        title={t('landing.feature.realTimeTitle')}
                        description={t('landing.feature.realTimeDesc')}
                        colorClass={styles.featureCardIconPrimary}
                    />
                    <FeatureCard
                        icon={<Trophy />}
                        title={t('landing.feature.leaderboardTitle')}
                        description={t('landing.feature.leaderboardDesc')}
                        colorClass={styles.featureCardIconTeal}
                    />
                    <FeatureCard
                        icon={<BarChart3 />}
                        title={t('landing.feature.analyticsTitle')}
                        description={t('landing.feature.analyticsDesc')}
                        colorClass={styles.featureCardIconPink}
                    />
                    <FeatureCard
                        icon={<CheckCircle2 />}
                        title={t('landing.feature.easyTitle')}
                        description={t('landing.feature.easyDesc')}
                        colorClass={styles.featureCardIconSuccess}
                    />
                    <FeatureCard
                        icon={<Users />}
                        title={t('landing.feature.typesTitle')}
                        description={t('landing.feature.typesDesc')}
                        colorClass={styles.featureCardIconOrange}
                    />
                    <FeatureCard
                        icon={<Zap />}
                        title={t('landing.feature.flexTitle')}
                        description={t('landing.feature.flexDesc')}
                        colorClass={styles.featureCardIconPrimary}
                    />
                </div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerContent}>
                        <div className={styles.footerBrand}>
                            <Zap />
                            <span>{t('landing.footer.copyright')}</span>
                        </div>
                        <div className={styles.footerLinks}>
                            <Link to={ROUTES.ABOUT} className={styles.footerLink}>
                                {t('landing.footer.about')}
                            </Link>
                            <Link to={ROUTES.PRIVACY} className={styles.footerLink}>
                                {t('landing.footer.privacy')}
                            </Link>
                            <Link to={ROUTES.TERMS} className={styles.footerLink}>
                                {t('landing.footer.terms')}
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
});

function FeatureCard({
    icon,
    title,
    description,
    colorClass,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    colorClass: string;
}) {
    return (
        <div className={styles.featureCard}>
            <div className={`${styles.featureCardIcon} ${colorClass}`}>{icon}</div>
            <h3 className={styles.featureCardTitle}>{title}</h3>
            <p className={styles.featureCardDesc}>{description}</p>
        </div>
    );
}
