import { i18nStore } from '@shared/lib/i18n';
import { render, screen } from '@testing-library/react';
import { AnswerStatsBar } from '@widgets/AnswerStats/ui/AnswerStatsBar';
import { beforeEach, describe, expect, it } from 'vitest';

describe('AnswerStatsBar', () => {
    beforeEach(() => {
        i18nStore.setLocale('en');
    });

    it('renders the response count', () => {
        render(<AnswerStatsBar count={42} percentage={60} />);
        expect(screen.getByText('42 responses')).toBeDefined();
    });

    it('renders the percentage', () => {
        render(<AnswerStatsBar count={10} percentage={75} />);
        expect(screen.getByText('75%')).toBeDefined();
    });

    it('sets the bar width proportional to percentage', () => {
        render(<AnswerStatsBar count={5} percentage={40} />);
        const bar = document.querySelector('[style*="width: 40%"]');
        expect(bar).not.toBeNull();
    });
});
