import { useStore } from '@app/providers/useStore';
import { ROUTES } from '@shared/config/routes';
import { useTranslation } from '@shared/lib/useTranslation';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Label } from '@shared/ui/Label';
import { Loader2 } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import styles from './JoinForm.module.scss';

export const JoinForm = observer(() => {
    const navigate = useNavigate();
    const { session } = useStore();
    const { t } = useTranslation();
    const [roomCode, setRoomCode] = useState('');
    const [nickname, setNickname] = useState('');

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomCode || !nickname) {
            toast.error(t('joinForm.errorBoth'));
            return;
        }
        if (roomCode.length < 6) {
            toast.error(t('joinForm.errorCode'));
            return;
        }
        await session.joinSession(roomCode, nickname);
        if (session.error) {
            toast.error(session.error);
            return;
        }
        navigate(ROUTES.PARTICIPANT_LIVE(roomCode));
    };

    return (
        <form onSubmit={handleJoin} className={styles.form}>
            <div className={styles.fieldGroup}>
                <Label htmlFor='roomCode'>{t('joinForm.roomCode')}</Label>
                <Input
                    id='roomCode'
                    placeholder={t('joinForm.roomCodePlaceholder')}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className={styles.codeInput}
                    maxLength={10}
                    autoComplete='off'
                />
            </div>
            <div className={styles.fieldGroup}>
                <Label htmlFor='nickname'>{t('joinForm.nickname')}</Label>
                <Input
                    id='nickname'
                    placeholder={t('joinForm.nicknamePlaceholder')}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                />
            </div>
            <Button
                type='submit'
                className={styles.submitButton}
                size='lg'
                disabled={session.isLoading}
            >
                {session.isLoading ? (
                    <span className={styles.spinnerRow}>
                        <Loader2 className={styles.spin} />
                        {t('joinForm.submitting')}
                    </span>
                ) : (
                    t('joinForm.submit')
                )}
            </Button>
        </form>
    );
});
