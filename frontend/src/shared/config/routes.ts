export const ROUTES = {
    LANDING: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    ABOUT: '/about',
    PRIVACY: '/privacy',
    TERMS: '/terms',

    ORGANIZER_DASHBOARD: '/organizer/dashboard',
    ORGANIZER_QUIZ_NEW: '/organizer/quiz/new',
    ORGANIZER_QUIZ_EDIT: (id: string) => `/organizer/quiz/${id}/edit`,
    ORGANIZER_QUIZ_SETTINGS: (id: string) => `/organizer/quiz/${id}/settings`,
    ORGANIZER_QUIZ_LIVE: (id: string) => `/organizer/quiz/${id}/live`,
    ORGANIZER_ACCOUNT: '/organizer/account',

    PARTICIPANT_JOIN: '/join',
    PARTICIPANT_LIVE: (roomCode: string) => `/quiz/${roomCode}/live`,
    PARTICIPANT_RESULTS: (roomCode: string) => `/quiz/${roomCode}/results`,
    PARTICIPANT_ACCOUNT: '/participant/account',
} as const;
