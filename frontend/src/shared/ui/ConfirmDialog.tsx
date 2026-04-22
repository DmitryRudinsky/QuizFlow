import { Button } from './Button';
import styles from './ConfirmDialog.module.scss';

interface Props {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog = ({
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
}: Props) => (
    <div className={styles.overlay} onClick={onCancel}>
        <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <p className={styles.title}>{title}</p>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
                <Button data-variant='outline' onClick={onCancel}>
                    {cancelLabel}
                </Button>
                <Button data-variant='destructive' onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </div>
        </div>
    </div>
);
