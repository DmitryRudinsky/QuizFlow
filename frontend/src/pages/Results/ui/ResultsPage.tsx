import { useStore } from '@app/providers/useStore';
import { ResultsLeaderboard } from '@widgets/ResultsLeaderboard/ui/ResultsLeaderboard';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useParams } from 'react-router';

import styles from './ResultsPage.module.scss';

export const ResultsPage = observer(() => {
    const { roomCode } = useParams();
    const { session } = useStore();

    useEffect(() => {
        void session.fetchLeaderboard(roomCode);
    }, [session, roomCode]);

    const entries = session.leaderboard.map((e, index) => ({
        id: e.participantId,
        name: e.nickname,
        score: e.score,
        correct: 0,
        total: session.totalQuestions,
        rank: e.rank ?? index + 1,
    }));

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <ResultsLeaderboard entries={entries} />
            </div>
        </div>
    );
});
