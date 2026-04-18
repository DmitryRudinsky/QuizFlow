import { useStore } from '@app/providers/useStore';
import { ResultsLeaderboard } from '@widgets/ResultsLeaderboard/ui/ResultsLeaderboard';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useParams } from 'react-router';

import styles from './ResultsPage.module.scss';

export const ResultsPage = observer(() => {
    const { roomCode } = useParams<{ roomCode: string }>();
    const { session } = useStore();

    useEffect(() => {
        if (roomCode && session.roomCode !== roomCode) {
            session.roomCode = roomCode;
        }
        void session.fetchLeaderboard();
    }, [roomCode, session]);

    const entries = session.leaderboard.map((entry) => ({
        id: entry.participantId,
        name: entry.nickname,
        score: entry.score,
        rank: entry.rank,
        correct: 0,
        total: session.totalQuestions,
    }));

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <ResultsLeaderboard entries={entries} />
            </div>
        </div>
    );
});
