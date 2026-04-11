import { ResultsLeaderboard } from '@widgets/ResultsLeaderboard/ui/ResultsLeaderboard';

import styles from './ResultsPage.module.scss';

const mockLeaderboard = [
    { id: '1', name: 'Alice', score: 1450, correct: 15, total: 15, rank: 1 },
    { id: '2', name: 'Bob', score: 1380, correct: 14, total: 15, rank: 2 },
    { id: '3', name: 'Charlie', score: 1320, correct: 14, total: 15, rank: 3 },
    { id: '4', name: 'Diana', score: 1250, correct: 13, total: 15, rank: 4 },
    { id: '5', name: 'Eve', score: 1200, correct: 13, total: 15, rank: 5 },
    { id: '6', name: 'Frank', score: 1150, correct: 12, total: 15, rank: 6 },
    { id: '7', name: 'Grace', score: 1100, correct: 12, total: 15, rank: 7 },
    { id: '8', name: 'Henry', score: 1050, correct: 11, total: 15, rank: 8 },
];

export const ResultsPage = () => {
    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <ResultsLeaderboard entries={mockLeaderboard} />
            </div>
        </div>
    );
};
