import { useTranslation } from '@shared/lib/useTranslation';
import { AlertCircle, CheckCircle2, FileQuestion, Users, WifiOff } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { Button } from './Button';
import { Card, CardContent } from './Card';
import styles from './StateComponents.module.scss';

export type EmptyStateType = 'no-quizzes' | 'no-participants' | 'no-history';

interface EmptyStateProps {
    type: EmptyStateType;
    action?: () => void;
    actionLabel?: string;
}

export const EmptyState = observer(function EmptyState({
    type,
    action,
    actionLabel,
}: EmptyStateProps) {
    const { t } = useTranslation();

    const configs = {
        'no-quizzes': {
            icon: <FileQuestion className={`${styles.icon} ${styles.iconMuted}`} />,
            title: t('states.noQuizzesTitle'),
            description: t('states.noQuizzesDesc'),
        },
        'no-participants': {
            icon: <Users className={`${styles.icon} ${styles.iconMuted}`} />,
            title: t('states.noParticipantsTitle'),
            description: t('states.noParticipantsDesc'),
        },
        'no-history': {
            icon: <FileQuestion className={`${styles.icon} ${styles.iconMuted}`} />,
            title: t('states.noHistoryTitle'),
            description: t('states.noHistoryDesc'),
        },
    };

    const config = configs[type];

    return (
        <Card>
            <CardContent className={styles.cardContent}>
                {config.icon}
                <h3 className={styles.title}>{config.title}</h3>
                <p className={styles.description}>{config.description}</p>
                {action && actionLabel && <Button onClick={action}>{actionLabel}</Button>}
            </CardContent>
        </Card>
    );
});

export type ErrorStateType = 'invalid-code' | 'network-error' | 'session-ended';

interface ErrorStateProps {
    type: ErrorStateType;
    onRetry?: () => void;
}

export const ErrorState = observer(function ErrorState({ type, onRetry }: ErrorStateProps) {
    const { t } = useTranslation();

    const configs = {
        'invalid-code': {
            icon: <AlertCircle className={`${styles.icon} ${styles.iconDestructive}`} />,
            title: t('states.invalidCodeTitle'),
            description: t('states.invalidCodeDesc'),
        },
        'network-error': {
            icon: <WifiOff className={`${styles.icon} ${styles.iconDestructive}`} />,
            title: t('states.networkErrorTitle'),
            description: t('states.networkErrorDesc'),
        },
        'session-ended': {
            icon: <AlertCircle className={`${styles.icon} ${styles.iconWarning}`} />,
            title: t('states.sessionEndedTitle'),
            description: t('states.sessionEndedDesc'),
        },
    };

    const config = configs[type];

    return (
        <Card className={styles.errorCard}>
            <CardContent className={styles.cardContent}>
                {config.icon}
                <h3 className={styles.title}>{config.title}</h3>
                <p className={styles.description}>{config.description}</p>
                {onRetry && type !== 'network-error' && (
                    <Button variant='outline' onClick={onRetry}>
                        {t('states.tryAgain')}
                    </Button>
                )}
                {type === 'network-error' && (
                    <div className={styles.reconnecting}>
                        <div className={styles.reconnectingSpinner} />
                        <span>{t('states.reconnecting')}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

interface SuccessStateProps {
    title: string;
    description: string;
}

export function SuccessState({ title, description }: SuccessStateProps) {
    return (
        <Card className={styles.successCard}>
            <CardContent className={styles.successCardContent}>
                <CheckCircle2 className={styles.successIcon} />
                <h3 className={styles.successTitle}>{title}</h3>
                <p className={styles.successDescription}>{description}</p>
            </CardContent>
        </Card>
    );
}

export const NetworkStatus = observer(function NetworkStatus({ isOnline }: { isOnline: boolean }) {
    const { t } = useTranslation();

    if (isOnline) {
        return null;
    }

    return (
        <Card className={styles.networkCard}>
            <CardContent className={styles.networkCardContent}>
                <WifiOff className={styles.networkIcon} />
                <span className={styles.networkText}>{t('states.connectionLost')}</span>
            </CardContent>
        </Card>
    );
});
