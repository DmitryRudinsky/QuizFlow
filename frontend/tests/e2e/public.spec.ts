import { expect, test } from '@playwright/test';

test.describe('Public pages', () => {
    test.describe('Landing page', () => {
        test('renders hero section', async ({ page }) => {
            await page.goto('/');
            await expect(
                page.getByRole('heading', { name: /Create, Host, and Play/i }),
            ).toBeVisible();
        });

        test('"Log In" navigates to /login', async ({ page }) => {
            await page.goto('/');
            await page.getByRole('link', { name: 'Log In' }).first().click();
            await expect(page).toHaveURL(/\/login/);
        });

        test('"Create Quiz" CTA navigates to /signup', async ({ page }) => {
            await page.goto('/');
            // Click the hero CTA "Create Quiz" button
            await page.getByRole('link', { name: 'Create Quiz' }).first().click();
            await expect(page).toHaveURL(/\/signup/);
        });

        test('"Join Quiz" CTA navigates to /join', async ({ page }) => {
            await page.goto('/');
            await page.getByRole('link', { name: 'Join Quiz' }).first().click();
            await expect(page).toHaveURL(/\/join/);
        });

        test('footer "About" navigates to /about', async ({ page }) => {
            await page.goto('/');
            await page.getByRole('link', { name: 'About' }).click();
            await expect(page).toHaveURL(/\/about/);
        });

        test('footer "Privacy" navigates to /privacy', async ({ page }) => {
            await page.goto('/');
            await page.getByRole('link', { name: 'Privacy' }).click();
            await expect(page).toHaveURL(/\/privacy/);
        });

        test('footer "Terms" navigates to /terms', async ({ page }) => {
            await page.goto('/');
            await page.getByRole('link', { name: 'Terms' }).click();
            await expect(page).toHaveURL(/\/terms/);
        });
    });

    test.describe('About page', () => {
        test('renders heading', async ({ page }) => {
            await page.goto('/about');
            await expect(page.getByRole('heading', { name: /About QuizFlow/i })).toBeVisible();
        });

        test('"Back to Home" navigates to /', async ({ page }) => {
            await page.goto('/about');
            await page.getByRole('button', { name: /Back to Home/i }).click();
            await expect(page).toHaveURL('/');
        });
    });

    test.describe('Privacy page', () => {
        test('renders heading', async ({ page }) => {
            await page.goto('/privacy');
            await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible();
        });

        test('"Back to Home" navigates to /', async ({ page }) => {
            await page.goto('/privacy');
            await page.getByRole('button', { name: /Back to Home/i }).click();
            await expect(page).toHaveURL('/');
        });
    });

    test.describe('Terms page', () => {
        test('renders heading', async ({ page }) => {
            await page.goto('/terms');
            await expect(page.getByRole('heading', { name: /Terms of Service/i })).toBeVisible();
        });

        test('"Back to Home" navigates to /', async ({ page }) => {
            await page.goto('/terms');
            await page.getByRole('button', { name: /Back to Home/i }).click();
            await expect(page).toHaveURL('/');
        });
    });

    test.describe('404 page', () => {
        test('renders for unknown routes', async ({ page }) => {
            await page.goto('/this-route-does-not-exist');
            await expect(page.getByText('Page Not Found')).toBeVisible();
        });

        test('"Back to Home" navigates to /', async ({ page }) => {
            await page.goto('/this-route-does-not-exist');
            await page.getByRole('button', { name: /Back to Home/i }).click();
            await expect(page).toHaveURL('/');
        });
    });
});
