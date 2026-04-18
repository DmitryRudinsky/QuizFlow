import { expect, test } from '@playwright/test';

import { mockApi } from './helpers/mocks';

test.describe('Participant flows', () => {
    test.beforeEach(async ({ page }) => {
        await mockApi(page);
    });

    test.describe('Join page', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/join');
        });

        test('renders "Join Quiz" heading', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Join Quiz' })).toBeVisible();
        });

        test('empty submit shows error toast', async ({ page }) => {
            await page.getByRole('button', { name: 'Join Quiz' }).click();
            await expect(page.getByText('Please enter both room code and nickname')).toBeVisible();
        });

        test('short room code shows "Invalid room code" error', async ({ page }) => {
            await page.fill('#roomCode', 'AB');
            await page.fill('#nickname', 'Alice');
            await page.getByRole('button', { name: 'Join Quiz' }).click();
            await expect(page.getByText('Invalid room code')).toBeVisible();
        });

        test('valid join navigates to participant live page', async ({ page }) => {
            await page.fill('#roomCode', 'ABC-123');
            await page.fill('#nickname', 'Alice');
            await page.getByRole('button', { name: 'Join Quiz' }).click();
            await page.waitForURL('**/quiz/ABC-123/live');
            await expect(page).toHaveURL(/\/quiz\/ABC-123\/live/);
        });

        test('room code input auto-uppercases input', async ({ page }) => {
            await page.fill('#roomCode', 'abc-123');
            const value = await page.locator('#roomCode').inputValue();
            expect(value).toBe('ABC-123');
        });
    });

    test.describe('Participant Live page', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/quiz/ABC-123/live');
        });

        test('shows waiting state before host starts question', async ({ page }) => {
            await expect(page.getByText(/Waiting/i)).toBeVisible();
        });
    });

    test.describe('Results page', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/quiz/ABC-123/results');
        });

        test('renders "Quiz Complete!" heading', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Quiz Complete!' })).toBeVisible();
        });

        test('shows full leaderboard section', async ({ page }) => {
            await expect(page.getByText('Full Leaderboard')).toBeVisible();
        });

        test('shows podium with 1st, 2nd, 3rd places', async ({ page }) => {
            await expect(page.getByText('1st')).toBeVisible();
            await expect(page.getByText('2nd')).toBeVisible();
            await expect(page.getByText('3rd')).toBeVisible();
        });

        test('"Back to Home" navigates to /', async ({ page }) => {
            await page.getByRole('button', { name: /Back to Home/i }).click();
            await expect(page).toHaveURL('/');
        });

        test('"View My Stats" navigates to /participant/account', async ({ page }) => {
            await page.getByRole('button', { name: /View My Stats/i }).click();
            await expect(page).toHaveURL(/\/participant\/account/);
        });
    });

    test.describe('Participant Account page', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/participant/account');
        });

        test('renders "My Account" heading', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();
        });

        test('shows stats card "Quizzes Played"', async ({ page }) => {
            await expect(page.getByText('Quizzes Played')).toBeVisible();
        });

        test('shows quiz history section', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Quiz History' })).toBeVisible();
        });

        test('"Log Out" button is visible', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();
        });
    });
});
