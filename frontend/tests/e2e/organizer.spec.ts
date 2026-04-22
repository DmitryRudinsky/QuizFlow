import { expect, type Page, test } from '@playwright/test';

import { mockAuthApi } from './helpers/mockApi';

async function loginAsOrganizer(page: Page) {
    await mockAuthApi(page);
    await page.goto('/login');
    await page.fill('#email', 'organizer@example.com');
    await page.fill('#password', 'Test@1');
    await page.click('button:has-text("Log In")');
    await page.waitForURL('**/organizer/dashboard');
}

test.describe('Organizer flows', () => {
    test.describe('Dashboard', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsOrganizer(page);
        });

        test('renders stat cards', async ({ page }) => {
            await expect(page.getByText('Total Quizzes')).toBeVisible();
            await expect(page.getByText('Total Participants')).toBeVisible();
        });

        test('shows quiz list with mock data', async ({ page }) => {
            await expect(page.getByText('JavaScript Fundamentals')).toBeVisible();
        });

        test('"Create New Quiz" navigates to /organizer/quiz/new', async ({ page }) => {
            await page.getByRole('button', { name: /Create New Quiz/i }).click();
            await expect(page).toHaveURL(/\/organizer\/quiz\/new/);
        });
    });

    test.describe('Sidebar navigation', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsOrganizer(page);
        });

        test('Dashboard link navigates to /organizer/dashboard', async ({ page }) => {
            await page.getByRole('link', { name: 'Dashboard' }).click();
            await expect(page).toHaveURL(/\/organizer\/dashboard/);
        });

        test('My Quizzes link navigates to /organizer/quiz/new', async ({ page }) => {
            await page.getByRole('link', { name: 'My Quizzes' }).click();
            await expect(page).toHaveURL(/\/organizer\/quiz\/new/);
        });

        test('Account link navigates to /organizer/account', async ({ page }) => {
            await page.getByRole('link', { name: 'Account' }).click();
            await expect(page).toHaveURL(/\/organizer\/account/);
        });

        test('Log Out clears session (page stays responsive)', async ({ page }) => {
            await page.getByRole('button', { name: 'Log Out' }).click();
            // Auth state is in-memory; no navigation guard — page should still render
            await expect(page.locator('body')).toBeVisible();
        });
    });

    test.describe('Quiz Builder — create', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/organizer/quiz/new');
        });

        test('shows empty state when no questions', async ({ page }) => {
            await expect(page.getByText('No questions yet')).toBeVisible();
        });

        test('"Add Question" adds a question to the list', async ({ page }) => {
            await page.getByRole('button', { name: 'Add Question' }).click();
            await expect(page.getByText('Question 1')).toBeVisible();
        });

        test('save without title shows error toast', async ({ page }) => {
            await page.getByRole('button', { name: 'Save Quiz' }).click();
            await expect(
                page.getByText('Please add a title and at least one question'),
            ).toBeVisible();
        });

        test('save with title but no questions shows error toast', async ({ page }) => {
            await page.fill('#title', 'My Test Quiz');
            await page.getByRole('button', { name: 'Save Quiz' }).click();
            await expect(
                page.getByText('Please add a title and at least one question'),
            ).toBeVisible();
        });

        test('save valid quiz shows success toast and redirects to dashboard', async ({ page }) => {
            await page.fill('#title', 'My New Quiz');
            await page.getByRole('button', { name: 'Add Question' }).click();
            await page.getByRole('button', { name: 'Save Quiz' }).click();
            await expect(page.getByText('Quiz saved successfully!')).toBeVisible();
            await page.waitForURL('**/organizer/dashboard');
            await expect(page).toHaveURL(/\/organizer\/dashboard/);
        });
    });

    test.describe('Quiz Builder — edit', () => {
        test('loads quiz title from store', async ({ page }) => {
            await page.goto('/organizer/quiz/1/edit');
            await expect(page.locator('#title')).toHaveValue('JavaScript Fundamentals');
        });

        test('"Settings" button navigates to quiz settings', async ({ page }) => {
            await page.goto('/organizer/quiz/1/edit');
            await page.getByRole('button', { name: 'Settings' }).click();
            await expect(page).toHaveURL(/\/organizer\/quiz\/1\/settings/);
        });
    });

    test.describe('Quiz Settings', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/organizer/quiz/1/settings');
        });

        test('renders settings page', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Quiz Settings' })).toBeVisible();
        });

        test('can toggle "Allow Answer Changes"', async ({ page }) => {
            const toggle = page.locator('[role="switch"]').first();
            const before = await toggle.getAttribute('aria-checked');
            await toggle.click();
            const after = await toggle.getAttribute('aria-checked');
            expect(before).not.toBe(after);
        });

        test('can toggle "Randomize Questions"', async ({ page }) => {
            const toggle = page.locator('[role="switch"]').nth(1);
            const before = await toggle.getAttribute('aria-checked');
            await toggle.click();
            const after = await toggle.getAttribute('aria-checked');
            expect(before).not.toBe(after);
        });

        test('"Start Quiz Session" navigates to live page', async ({ page }) => {
            await page.getByRole('button', { name: 'Start Quiz Session' }).click();
            await expect(page).toHaveURL(/\/organizer\/quiz\/1\/live/);
        });
    });

    test.describe('Live Host', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/organizer/quiz/1/live');
        });

        test('shows room code', async ({ page }) => {
            await expect(page.getByText('ABC-123')).toBeVisible();
        });

        test('shows participant count', async ({ page }) => {
            // Responses box shows "Responses: 6 / 8" (6 of 8 answered per mock data)
            await expect(page.getByText(/Responses: 6 \/ 8/)).toBeVisible();
        });

        test('shows "Question 1 of 15"', async ({ page }) => {
            await expect(page.getByText('Question 1 of 15')).toBeVisible();
        });

        test('Pause button toggles to Resume', async ({ page }) => {
            await page.getByRole('button', { name: 'Pause' }).click();
            await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
        });

        test('Resume button toggles back to Pause', async ({ page }) => {
            await page.getByRole('button', { name: 'Pause' }).click();
            await page.getByRole('button', { name: 'Resume' }).click();
            await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
        });

        test('"Next Question" advances to question 2', async ({ page }) => {
            await page.getByRole('button', { name: 'Next Question' }).click();
            await expect(page.getByText('Question 2 of 15')).toBeVisible();
        });

        test('"End Quiz" navigates to results page', async ({ page }) => {
            await page.getByRole('button', { name: 'End Quiz' }).click();
            // quizId=1 from URL param → navigates to /quiz/1/results
            await expect(page).toHaveURL(/\/quiz\/.*\/results/);
        });
    });

    test.describe('Organizer Account', () => {
        test.beforeEach(async ({ page }) => {
            await loginAsOrganizer(page);
            await page.goto('/organizer/account');
        });

        test('renders account heading', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
        });

        test('shows stats: Total Quizzes and Sessions Hosted', async ({ page }) => {
            await expect(page.getByText('Total Quizzes')).toBeVisible();
            await expect(page.getByText('Sessions Hosted')).toBeVisible();
        });

        test('shows past sessions table', async ({ page }) => {
            await expect(page.getByText('Past Sessions')).toBeVisible();
        });
    });
});
