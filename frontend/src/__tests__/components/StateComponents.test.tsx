import { i18nStore } from '@shared/lib/i18n';
import { EmptyState, ErrorState } from '@shared/ui/StateComponents';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('StateComponents', () => {
    beforeEach(() => {
        i18nStore.setLocale('en');
    });

    describe('EmptyState', () => {
        it('renders no-quizzes state title', () => {
            render(<EmptyState type='no-quizzes' />);
            expect(screen.getByText(i18nStore.t('states.noQuizzesTitle'))).toBeDefined();
        });

        it('renders no-participants state title', () => {
            render(<EmptyState type='no-participants' />);
            expect(screen.getByText(i18nStore.t('states.noParticipantsTitle'))).toBeDefined();
        });

        it('renders no-history state title', () => {
            render(<EmptyState type='no-history' />);
            expect(screen.getByText(i18nStore.t('states.noHistoryTitle'))).toBeDefined();
        });

        it('renders action button when action and actionLabel are provided', async () => {
            const action = vi.fn();
            render(<EmptyState type='no-quizzes' action={action} actionLabel='Create Quiz' />);
            await userEvent.click(screen.getByText('Create Quiz'));
            expect(action).toHaveBeenCalledOnce();
        });
    });

    describe('ErrorState', () => {
        it('renders invalid-code state title', () => {
            render(<ErrorState type='invalid-code' />);
            expect(screen.getByText(i18nStore.t('states.invalidCodeTitle'))).toBeDefined();
        });

        it('renders network-error state title', () => {
            render(<ErrorState type='network-error' />);
            expect(screen.getByText(i18nStore.t('states.networkErrorTitle'))).toBeDefined();
        });

        it('renders session-ended state title', () => {
            render(<ErrorState type='session-ended' />);
            expect(screen.getByText(i18nStore.t('states.sessionEndedTitle'))).toBeDefined();
        });

        it('renders retry button for invalid-code when onRetry is provided', async () => {
            const onRetry = vi.fn();
            render(<ErrorState type='invalid-code' onRetry={onRetry} />);
            await userEvent.click(screen.getByText(i18nStore.t('states.tryAgain')));
            expect(onRetry).toHaveBeenCalledOnce();
        });

        it('shows reconnecting text for network-error (no retry button)', () => {
            render(<ErrorState type='network-error' onRetry={() => {}} />);
            expect(screen.getByText(i18nStore.t('states.reconnecting'))).toBeDefined();
        });
    });
});
