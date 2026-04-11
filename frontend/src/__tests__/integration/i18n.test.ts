import { i18nStore } from '@shared/lib/i18n';
import { beforeEach, describe, expect, it } from 'vitest';

describe('I18nStore', () => {
    beforeEach(() => {
        localStorage.clear();
        i18nStore.setLocale('en');
    });

    describe('locale', () => {
        it('defaults to "en"', () => {
            expect(i18nStore.locale).toBe('en');
        });

        it('setLocale changes the locale', () => {
            i18nStore.setLocale('ru');
            expect(i18nStore.locale).toBe('ru');
        });

        it('setLocale persists to localStorage', () => {
            i18nStore.setLocale('ru');
            expect(localStorage.getItem('locale')).toBe('ru');
        });
    });

    describe('t() — translation lookup', () => {
        it('returns the English string for a known key', () => {
            expect(i18nStore.t('common.save')).toBe('Save');
        });

        it('returns the Russian string after switching locale', () => {
            i18nStore.setLocale('ru');
            expect(i18nStore.t('common.save')).toBe('Сохранить');
        });

        it('returns the key itself when the key is unknown', () => {
            expect(i18nStore.t('nonexistent.key')).toBe('nonexistent.key');
        });

        it('resolves nested dot-separated keys', () => {
            // "landing.feature.realTimeTitle" → "Real-Time Interaction"
            expect(i18nStore.t('landing.feature.realTimeTitle')).toBe('Real-Time Interaction');
        });
    });

    describe('t() — parameter substitution', () => {
        it('substitutes a single {param}', () => {
            // "answerStats.responses" → "{count} responses"
            expect(i18nStore.t('answerStats.responses', { count: 42 })).toBe('42 responses');
        });

        it('substitutes multiple params', () => {
            // "liveHost.questionOf" → "Question {current} of {total}"
            expect(i18nStore.t('liveHost.questionOf', { current: 2, total: 5 })).toBe(
                'Question 2 of 5',
            );
        });

        it('substitutes param in Russian string', () => {
            i18nStore.setLocale('ru');
            expect(i18nStore.t('answerStats.responses', { count: 10 })).toContain('10');
        });
    });
});
