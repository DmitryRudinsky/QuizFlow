import { useStore } from '@app/providers/StoreProvider';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { FileQuestion, LayoutDashboard, LogOut, User } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Link, useLocation } from 'react-router';

import styles from './OrganizerSidebar.module.scss';

export const OrganizerSidebar = observer(function OrganizerSidebar() {
    const { auth } = useStore();
    const { t } = useTranslation();
    const location = useLocation();

    const navItems = [
        { to: ROUTES.ORGANIZER_DASHBOARD, icon: <LayoutDashboard />, label: t('nav.dashboard') },
        { to: ROUTES.ORGANIZER_QUIZ_NEW, icon: <FileQuestion />, label: t('nav.myQuizzes') },
        { to: ROUTES.ORGANIZER_ACCOUNT, icon: <User />, label: t('nav.account') },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <span className={styles.logoQ}>Q</span>
                </div>
                <span className={styles.logoText}>{t('common.appName')}</span>
            </div>

            <nav className={styles.nav}>
                {navItems.map(({ to, icon, label }) => (
                    <Link key={to} to={to}>
                        <button
                            className={`${styles.navItem} ${location.pathname === to ? styles['navItem--active'] : ''}`}
                        >
                            {icon}
                            <span>{label}</span>
                        </button>
                    </Link>
                ))}
            </nav>

            <div className={styles.footer}>
                <div className={styles.languageSwitcherRow}>
                    <LanguageSwitcher />
                </div>
                <button className={styles.navItem} onClick={() => auth.logout()}>
                    <LogOut />
                    <span>{t('common.logOut')}</span>
                </button>
            </div>
        </aside>
    );
});
