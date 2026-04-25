import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mockAuthApi } from './helpers/mockApi';

async function loginAs(page: Page, email: string) {
    await mockAuthApi(page);
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', 'Test@1');
    await page.click('button:has-text("Log In")');
}

test.describe('Auth flows', () => {
    test.describe('Login', () => {
        test('organizer email redirects to /organizer/dashboard', async ({ page }) => {
            await loginAs(page, 'organizer@example.com');
            await page.waitForURL('**/organizer/dashboard');
            await expect(page).toHaveURL(/\/organizer\/dashboard/);
        });

        test('participant email redirects to /join', async ({ page }) => {
            await loginAs(page, 'alice@example.com');
            await page.waitForURL('**/join');
            await expect(page).toHaveURL(/\/join/);
        });

        test('shows "Logging in..." during login', async ({ page }) => {
            await mockAuthApi(page, 200);
            await page.goto('/login');
            await page.fill('#email', 'alice@example.com');
            await page.fill('#password', 'Test@1');
            await page.click('button:has-text("Log In")');
            await expect(page.getByText('Logging in...')).toBeVisible();
        });

        test('"Sign up" link navigates to /signup', async ({ page }) => {
            await page.goto('/login');
            await page.getByRole('link', { name: 'Sign up' }).click();
            await expect(page).toHaveURL(/\/signup/);
        });
    });

    test.describe('Sign Up', () => {
        test('organizer signup redirects to /organizer/dashboard', async ({ page }) => {
            await mockAuthApi(page);
            await page.goto('/signup');
            await page.getByText('Host Quizzes').click();
            await page.fill('#name', 'Test Host');
            await page.fill('#email', 'host@example.com');
            await page.fill('#password', 'Test@1');
            await page.click('button:has-text("Create Account")');
            await page.waitForURL('**/organizer/dashboard');
            await expect(page).toHaveURL(/\/organizer\/dashboard/);
        });

        test('participant signup redirects to /join', async ({ page }) => {
            await mockAuthApi(page);
            await page.goto('/signup');
            await page.getByText('Play Quizzes').click();
            await page.fill('#name', 'Test Player');
            await page.fill('#email', 'player@example.com');
            await page.fill('#password', 'Test@1');
            await page.click('button:has-text("Create Account")');
            await page.waitForURL('**/join');
            await expect(page).toHaveURL(/\/join/);
        });

        test('?role=organizer pre-selects organizer role', async ({ page }) => {
            await mockAuthApi(page);
            await page.goto('/signup?role=organizer');
            const hostButton = page.getByText('Host Quizzes');
            await expect(hostButton).toBeVisible();
            await page.fill('#name', 'Test Host');
            await page.fill('#email', 'host2@example.com');
            await page.fill('#password', 'Test@1');
            await page.click('button:has-text("Create Account")');
            await page.waitForURL('**/organizer/dashboard');
            await expect(page).toHaveURL(/\/organizer\/dashboard/);
        });

        test('"Log in" link navigates to /login', async ({ page }) => {
            await page.goto('/signup');
            await page.getByRole('link', { name: 'Log in' }).click();
            await expect(page).toHaveURL(/\/login/);
        });
    });

    test.describe('Forgot Password', () => {
        test('"Back to Login" navigates to /login', async ({ page }) => {
            await page.goto('/forgot-password');
            await page.getByRole('link', { name: /Back to Login/i }).click();
            await expect(page).toHaveURL(/\/login/);
        });
    });
});
