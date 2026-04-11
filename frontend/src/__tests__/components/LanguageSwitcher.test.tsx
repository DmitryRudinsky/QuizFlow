import { i18nStore } from '@shared/lib/i18n';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

describe('LanguageSwitcher', () => {
    beforeEach(() => {
        localStorage.clear();
        i18nStore.setLocale('en');
    });

    it('shows "EN" when locale is English', () => {
        render(<LanguageSwitcher />);
        expect(screen.getByText('EN')).toBeDefined();
    });

    it('shows "РУС" when locale is Russian', () => {
        i18nStore.setLocale('ru');
        render(<LanguageSwitcher />);
        expect(screen.getByText('РУС')).toBeDefined();
    });

    it('toggles locale from EN to RU on click', async () => {
        render(<LanguageSwitcher />);
        await userEvent.click(screen.getByText('EN'));
        expect(i18nStore.locale).toBe('ru');
    });

    it('toggles locale from RU to EN on click', async () => {
        i18nStore.setLocale('ru');
        render(<LanguageSwitcher />);
        await userEvent.click(screen.getByText('РУС'));
        expect(i18nStore.locale).toBe('en');
    });
});
