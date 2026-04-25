import type { Page } from '@playwright/test';

// ─── Quiz fixtures ───────────────────────────────────────────────────────────

export const QUIZ_FIXTURE = {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your JS knowledge',
    category: 'programming',
    questionCount: 3,
    createdBy: '00000000-0000-0000-0000-000000000001',
    createdAt: '2026-01-01T00:00:00.000Z',
};

export const QUIZ_DETAIL_FIXTURE = {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your JS knowledge',
    category: 'programming',
    createdBy: '00000000-0000-0000-0000-000000000001',
    createdAt: '2026-01-01T00:00:00.000Z',
    questions: [
        {
            id: 'q-00000000-0000-0000-0001',
            questionText: 'What is typeof null?',
            type: 'text',
            answerType: 'single',
            timeLimit: 30,
            points: 100,
            position: 0,
            answers: [
                { id: 'a-00000000-0001', text: 'null' },
                { id: 'a-00000000-0002', text: 'object' },
                { id: 'a-00000000-0003', text: 'undefined' },
                { id: 'a-00000000-0004', text: 'number' },
            ],
        },
    ],
};

// ─── Session fixtures ─────────────────────────────────────────────────────────

export const SESSION_FIXTURE = {
    id: 's-00000000-0000-0000-0000-000000000001',
    roomCode: 'ABC-123',
    quizId: '1',
    hostId: '00000000-0000-0000-0000-000000000001',
    status: 'waiting',
    currentQuestionIndex: 0,
};

export const JOIN_FIXTURE = {
    participantId: 'p-00000000-0000-0000-0000-000000000001',
    nickname: 'Alice',
    sessionId: 's-00000000-0000-0000-0000-000000000001',
    roomCode: 'ABC-123',
};

export const LEADERBOARD_FIXTURE = [
    { participantId: 'p1', nickname: 'Alice', score: 300, rank: 1, correctCount: 3 },
    { participantId: 'p2', nickname: 'Bob', score: 200, rank: 2, correctCount: 2 },
    { participantId: 'p3', nickname: 'Charlie', score: 100, rank: 3, correctCount: 1 },
    { participantId: 'p4', nickname: 'Dave', score: 50, rank: 4, correctCount: 0 },
    { participantId: 'p5', nickname: 'Eve', score: 0, rank: 5, correctCount: 0 },
];

// ─── WebSocket fixtures ───────────────────────────────────────────────────────

export const QUESTION_STARTED_FIXTURE = {
    questionIndex: 0,
    totalQuestions: 15,
    questionId: 'q1-uuid-0000-0000-000000000001',
    questionText: 'What is the output of: console.log(typeof null)?',
    answers: [
        { id: 'a1', text: 'null' },
        { id: 'a2', text: 'object' },
        { id: 'a3', text: 'undefined' },
        { id: 'a4', text: 'number' },
    ],
    timeLimit: 30,
    points: 100,
};

// ─── Auth mocks ───────────────────────────────────────────────────────────────

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

export async function mockAuthApi(page: Page, loginDelayMs = 0) {
    await page.route('**/api/auth/login', async (route) => {
        if (loginDelayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, loginDelayMs));
        }
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

// ─── Quiz mocks ───────────────────────────────────────────────────────────────

export async function mockQuizApi(page: Page) {
    // List and create
    await page.route('**/api/quizzes', async (route) => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([QUIZ_FIXTURE]),
            });
        } else if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({ ...QUIZ_DETAIL_FIXTURE, id: 'new-quiz-id' }),
            });
        } else {
            await route.continue();
        }
    });

    // Get detail, update, delete, add question
    await page.route('**/api/quizzes/**', async (route) => {
        const method = route.request().method();
        const url = route.request().url();
        if (url.includes('/questions')) {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'q-new-id',
                    questionText: '',
                    type: 'text',
                    answerType: 'single',
                    timeLimit: 30,
                    points: 100,
                    position: 0,
                    answers: [],
                }),
            });
        } else if (method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(QUIZ_DETAIL_FIXTURE),
            });
        } else if (method === 'PUT') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(QUIZ_DETAIL_FIXTURE),
            });
        } else if (method === 'DELETE') {
            await route.fulfill({ status: 204 });
        } else {
            await route.continue();
        }
    });
}

// ─── Session HTTP mocks ───────────────────────────────────────────────────────

export async function mockSessionApi(page: Page, roomCode = 'ABC-123') {
    const json = (body: unknown, status = 200) => ({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
    });

    // Create session
    await page.route('**/api/sessions', async (route) => {
        if (route.request().method() === 'POST') {
            await route.fulfill(json({ ...SESSION_FIXTURE, roomCode }, 201));
        } else {
            await route.continue();
        }
    });

    // Leaderboard (must be registered before wildcard routes so it takes priority)
    await page.route(`**/api/sessions/${roomCode}/leaderboard`, async (route) => {
        await route.fulfill(json(LEADERBOARD_FIXTURE));
    });

    // Start, join, answer, next, end
    await page.route('**/api/sessions/*/start', async (route) => {
        await route.fulfill(json({ ...SESSION_FIXTURE, roomCode, status: 'active' }));
    });

    await page.route('**/api/sessions/*/join', async (route) => {
        const body = route.request().postDataJSON() as { nickname: string };
        await route.fulfill(
            json({ ...JOIN_FIXTURE, roomCode, nickname: body.nickname ?? 'Alice' }, 201),
        );
    });

    await page.route('**/api/sessions/*/answer', async (route) => {
        const body = route.request().postDataJSON() as { answerIds: string[] };
        const isCorrect = body.answerIds.includes('a2');
        await route.fulfill(
            json({ isCorrect, pointsEarned: isCorrect ? 100 : 0, correctAnswerIds: ['a2'] }),
        );
    });

    await page.route('**/api/sessions/*/next', async (route) => {
        await route.fulfill(
            json({ ...SESSION_FIXTURE, roomCode, status: 'active', currentQuestionIndex: 1 }),
        );
    });

    await page.route('**/api/sessions/*/end', async (route) => {
        await route.fulfill(json({ ...SESSION_FIXTURE, roomCode, status: 'ended' }));
    });
}

// ─── STOMP WebSocket mock ─────────────────────────────────────────────────────

type SendEvent = (type: string, payload: object | string) => void;

/**
 * Mocks the STOMP WebSocket connection.
 * Responds to CONNECT with CONNECTED, then on SUBSCRIBE sends QUESTION_STARTED.
 * Returns a `sendEvent` function to push arbitrary WS events from HTTP route handlers.
 */
export async function mockStompWebSocket(
    page: Page,
    initialPayload: object = QUESTION_STARTED_FIXTURE,
): Promise<{ sendEvent: SendEvent }> {
    let sendEvent: SendEvent = () => {
        // no-op until WS connection is established
    };

    await page.routeWebSocket(/ws-stomp/, (ws) => {
        let subId = 'sub-0';

        const emit: SendEvent = (type, payload) => {
            const body = JSON.stringify({ type, payload });
            const frame =
                `MESSAGE\n` +
                `subscription:${subId}\n` +
                `destination:/topic/session/mock\n` +
                `content-type:application/json\n` +
                `content-length:${body.length}\n` +
                `\n` +
                `${body}\x00`;
            ws.send(frame);
        };

        // Expose emit so callers can send events later (e.g. from HTTP route mocks)
        sendEvent = emit;

        ws.onMessage((message) => {
            const text = message instanceof Buffer ? message.toString() : String(message);

            if (text.startsWith('CONNECT')) {
                ws.send('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\x00');
            } else if (text.startsWith('SUBSCRIBE')) {
                const match = text.match(/^id:([^\n]+)/m);
                subId = match?.[1]?.trim() ?? 'sub-0';
                // Send initial event after a brief delay to let subscription settle
                setTimeout(() => emit('QUESTION_STARTED', initialPayload), 150);
            }
            // Ignore DISCONNECT, SEND, heartbeats (\n)
        });
    });

    return {
        // Wrapper that forwards to the live emit closure; safe to call even before ws connects
        sendEvent: (type, payload) => sendEvent(type, payload),
    };
}
