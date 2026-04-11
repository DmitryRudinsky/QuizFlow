import { useTranslation } from '@shared/lib/useTranslation';
import { Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import styles from './CountdownTimer.module.scss';

interface CountdownTimerProps {
    timeLeft: number;
    totalTime: number;
    size?: 'small' | 'medium' | 'large';
}

export const CountdownTimer = observer(
    ({ timeLeft, totalTime, size = 'large' }: CountdownTimerProps) => {
        const { t } = useTranslation();
        const percentage = (timeLeft / totalTime) * 100;
        const isUrgent = percentage < 30;
        const isWarning = percentage < 50 && percentage >= 30;

        const stateClass = isUrgent
            ? styles['circle--urgent']
            : isWarning
              ? styles['circle--warning']
              : styles['circle--normal'];

        const sizeClass = styles[`circle--${size}`];

        return (
            <div className={styles.root} data-testid='countdown-timer'>
                <div className={`${styles.circle} ${sizeClass} ${stateClass}`}>{timeLeft}</div>
                {size === 'large' && (
                    <div className={styles.label}>
                        <Clock />
                        <span>{t('countdown.secondsLeft')}</span>
                    </div>
                )}
            </div>
        );
    },
);
