import { i18nStore } from '@shared/lib/i18n';
import { render, screen } from '@testing-library/react';
import { CountdownTimer } from '@widgets/CountdownTimer/ui/CountdownTimer';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CountdownTimer', () => {
    beforeEach(() => {
        i18nStore.setLocale('en');
    });

    it('renders the timeLeft value', () => {
        render(<CountdownTimer timeLeft={20} totalTime={30} />);
        expect(screen.getByText('20')).toBeDefined();
    });

    it('shows the "seconds left" label when size is large (default)', () => {
        render(<CountdownTimer timeLeft={15} totalTime={30} />);
        expect(screen.getByText(i18nStore.t('countdown.secondsLeft'))).toBeDefined();
    });

    it('does not show the label when size is small', () => {
        render(<CountdownTimer timeLeft={15} totalTime={30} size='small' />);
        const label = document.querySelector('.label');
        expect(label).toBeNull();
    });
});
