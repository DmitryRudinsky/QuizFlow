import { expect, type Page, test } from '@playwright/test';

// Kill all CSS transitions/animations so screenshots are pixel-stable
async function disableAnimations(page: Page) {
    await page.addStyleTag({
        content: `
            *, *::before, *::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
            }
        `,
    });
}

async function loginAsOrganizer(page: Page) {
    await page.goto('/login');
    await page.fill('#email', 'organizer@example.com');
    await page.fill('#password', 'pass');
    await page.click('button:has-text("Log In")');
    await page.waitForURL('**/organizer/dashboard');
}

// Fixed viewport for deterministic screenshots
test.use({ viewport: { width: 1280, height: 800 } });

test.describe('Visual regression — public pages', () => {
    test('landing', async ({ page }) => {
        await page.goto('/');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('landing.png');
    });

    test('about', async ({ page }) => {
        await page.goto('/about');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('about.png');
    });

    test('privacy', async ({ page }) => {
        await page.goto('/privacy');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('privacy.png');
    });

    test('terms', async ({ page }) => {
        await page.goto('/terms');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('terms.png');
    });

    test('404', async ({ page }) => {
        await page.goto('/nonexistent-page');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('not-found.png');
    });
});

test.describe('Visual regression — auth pages', () => {
    test('login', async ({ page }) => {
        await page.goto('/login');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('login.png');
    });

    test('signup', async ({ page }) => {
        await page.goto('/signup');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('signup.png');
    });

    test('forgot-password', async ({ page }) => {
        await page.goto('/forgot-password');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('forgot-password.png');
    });
});

test.describe('Visual regression — participant pages', () => {
    test('join', async ({ page }) => {
        await page.goto('/join');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('join.png');
    });

    test('participant-live', async ({ page }) => {
        await page.goto('/quiz/ABC-123/live');
        await disableAnimations(page);
        await page.addStyleTag({
            content: '[data-testid="countdown-timer"] { visibility: hidden; }',
        });
        await expect(page).toHaveScreenshot('participant-live.png');
    });

    test('results', async ({ page }) => {
        await page.goto('/quiz/ABC-123/results');
        await disableAnimations(page);
        await page.evaluate(() => document.querySelectorAll('canvas').forEach((c) => c.remove()));
        await expect(page).toHaveScreenshot('results.png');
    });

    test('participant-account', async ({ page }) => {
        await page.goto('/participant/account');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('participant-account.png');
    });
});

test.describe('Visual regression — organizer pages', () => {
    test('organizer-dashboard', async ({ page }) => {
        await loginAsOrganizer(page);
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('organizer-dashboard.png');
    });

    test('quiz-builder-new', async ({ page }) => {
        await page.goto('/organizer/quiz/new');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('quiz-builder-new.png');
    });

    test('quiz-builder-edit', async ({ page }) => {
        await page.goto('/organizer/quiz/1/edit');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('quiz-builder-edit.png');
    });

    test('quiz-settings', async ({ page }) => {
        await page.goto('/organizer/quiz/1/settings');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('quiz-settings.png');
    });

    test('live-host', async ({ page }) => {
        await page.goto('/organizer/quiz/1/live');
        await disableAnimations(page);
        await page.addStyleTag({
            content: '[data-testid="countdown-timer"] { visibility: hidden; }',
        });
        await expect(page).toHaveScreenshot('live-host.png');
    });

    test('organizer-account', async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto('/organizer/account');
        await disableAnimations(page);
        await expect(page).toHaveScreenshot('organizer-account.png');
    });
});
