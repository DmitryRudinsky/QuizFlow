import { useTranslation } from '@shared/lib/useTranslation';
import { observer } from 'mobx-react-lite';

import styles from './AnswerStatsBar.module.scss';

interface AnswerStatsBarProps {
    percentage: number;
    count: number;
}

export const AnswerStatsBar = observer(({ percentage, count }: AnswerStatsBarProps) => {
    const { t } = useTranslation();
    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <span className={styles.count}>{t('answerStats.responses', { count })}</span>
                <span className={styles.percent}>{percentage}%</span>
            </div>
            <div className={styles.track}>
                <div className={styles.bar} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
});
