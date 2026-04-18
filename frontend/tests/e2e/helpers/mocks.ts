import type { Page } from '@playwright/test';

const QUIZ_LIST = [
    {
        id: '1',
        title: 'JavaScript Fundamentals',
        description: 'JS basics',
        category: 'programming',
        createdBy: 'u1',
        createdAt: '2026-01-01T00:00:00Z',
        questionCount: 15,
    },
];

const QUIZ_DETAIL = {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'JS basics',
    category: 'programming',
    createdBy: 'u1',
    createdAt: '2026-01-01T00:00:00Z',
    questions: [],
};

const LEADERBOARD = [
    { participantId: 'p1', nickname: 'Alice', score: 1200, rank: 1 },
    { participantId: 'p2', nickname: 'Bob', score: 950, rank: 2 },
    { participantId: 'p3', nickname: 'Charlie', score: 800, rank: 3 },
];

export async function mockApi(page: Page) {
    await page.route('**/api/auth/login', async (route) => {
        const body = JSON.parse(route.request().postData() ?? '{}') as { email: string };
        const role =
            body.email.includes('organizer') || body.email.includes('host')
                ? 'organizer'
                : 'participant';
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'u1', name: 'Test User', email: body.email, role }),
        });
    });

    await page.route('**/api/auth/register', async (route) => {
        const body = JSON.parse(route.request().postData() ?? '{}') as {
            email: string;
            name: string;
            role?: string;
        };
        await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'u1',
                name: body.name,
                email: body.email,
                role: body.role ?? 'participant',
            }),
        });
    });

    await page.route('**/api/quizzes?**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(QUIZ_LIST),
        });
    });

    await page.route('**/api/quizzes/1**', async (route) => {
        const method = route.request().method();
        if (method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(QUIZ_DETAIL),
            });
        } else if (method === 'PUT' || method === 'PATCH') {
            const body = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ...QUIZ_DETAIL, ...body, questions: [] }),
            });
        } else if (method === 'DELETE') {
            await route.fulfill({ status: 204 });
        } else {
            await route.continue();
        }
    });

    await page.route('**/api/quizzes', async (route) => {
        if (route.request().method() === 'POST') {
            const body = JSON.parse(route.request().postData() ?? '{}') as {
                title: string;
                description?: string;
            };
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'new-1',
                    title: body.title,
                    description: body.description ?? '',
                    category: '',
                    createdBy: 'u1',
                    createdAt: new Date().toISOString(),
                    questions: [],
                }),
            });
        } else {
            await route.continue();
        }
    });

    await page.route('**/api/sessions', async (route) => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({ id: 'sess1', roomCode: 'ABC-123' }),
            });
        } else {
            await route.continue();
        }
    });

    await page.route('**/api/sessions/*/start**', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.route('**/api/sessions/*/next**', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.route('**/api/sessions/*/end**', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.route('**/api/sessions/*/join', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ participantId: 'p1' }),
        });
    });

    await page.route('**/api/sessions/*/answer', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ isCorrect: true, pointsEarned: 100, correctAnswerIds: ['a2'] }),
        });
    });

    await page.route('**/api/sessions/*/leaderboard', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(LEADERBOARD),
        });
    });

    // Block WebSocket connections to avoid STOMP errors in tests
    await page.route('**/ws**', (route) => route.abort());
}
