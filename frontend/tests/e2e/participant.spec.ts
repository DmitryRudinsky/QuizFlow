import { expect, test } from '@playwright/test';

test.describe('Participant flows', () => {
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

        test('shows question text', async ({ page }) => {
            await expect(
                page.getByText('What is the output of: console.log(typeof null)?'),
            ).toBeVisible();
        });

        test('shows 4 answer options', async ({ page }) => {
            // Answer buttons: null, object, undefined, number
            await expect(page.getByRole('button', { name: 'null' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'object' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'undefined' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'number' })).toBeVisible();
        });

        test('shows room code in header', async ({ page }) => {
            await expect(page.getByText(/Room: ABC-123/)).toBeVisible();
        });

        test('"Submit Answer" is disabled until an answer is selected', async ({ page }) => {
            const submitButton = page.getByRole('button', { name: 'Submit Answer' });
            await expect(submitButton).toBeDisabled();
        });

        test('selecting an answer enables "Submit Answer"', async ({ page }) => {
            await page.getByRole('button', { name: 'object' }).click();
            const submitButton = page.getByRole('button', { name: 'Submit Answer' });
            await expect(submitButton).toBeEnabled();
        });

        test('selecting correct answer and submitting shows "Correct!" feedback', async ({
            page,
        }) => {
            await page.getByRole('button', { name: 'object' }).click(); // correct answer
            await page.getByRole('button', { name: 'Submit Answer' }).click();
            await expect(page.getByText(/Correct!/)).toBeVisible({ timeout: 4000 });
        });

        test('selecting incorrect answer and submitting shows "Incorrect" feedback', async ({
            page,
        }) => {
            await page.getByRole('button', { name: 'null' }).click(); // incorrect answer
            await page.getByRole('button', { name: 'Submit Answer' }).click();
            await expect(page.getByText(/Incorrect/)).toBeVisible({ timeout: 4000 });
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
            // ResultsLeaderboard uses navigate() inside a <Button>, not a <Link>
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
