import type { Page } from '@playwright/test';

const ORGANIZER = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Test Organizer',
    email: 'organizer@example.com',
    role: 'organizer',
};

const PARTICIPANT = {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Test Player',
    email: 'alice@example.com',
    role: 'participant',
};

export async function mockAuthApi(page: Page) {
    await page.route('**/api/auth/login', async (route) => {
        const body = route.request().postDataJSON() as { email: string };
        const user =
            body.email.includes('organizer') || body.email.includes('host')
                ? ORGANIZER
                : PARTICIPANT;
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(user),
        });
    });

    await page.route('**/api/auth/register', async (route) => {
        const body = route.request().postDataJSON() as {
            email: string;
            name: string;
            role: string;
        };
        const user = {
            id: '00000000-0000-0000-0000-000000000003',
            name: body.name,
            email: body.email,
            role: body.role,
        };
        await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(user),
        });
    });

    await page.route('**/api/auth/logout', async (route) => {
        await route.fulfill({ status: 204 });
    });
}
