import { useTranslation } from '@shared/lib/useTranslation';
import { observer } from 'mobx-react-lite';

import { Button } from './Button';
import styles from './LanguageSwitcher.module.scss';

export const LanguageSwitcher = observer(() => {
    const { locale, setLocale } = useTranslation();
    return (
        <Button
            variant='ghost'
            size='sm'
            className={styles.button}
            onClick={() => setLocale(locale === 'en' ? 'ru' : 'en')}
        >
            {locale === 'en' ? 'EN' : 'РУС'}
        </Button>
    );
});
