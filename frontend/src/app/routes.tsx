import { AboutPage } from '@pages/About/ui/AboutPage';
import { ForgotPasswordPage } from '@pages/ForgotPassword/ui/ForgotPasswordPage';
import { LandingPage } from '@pages/Landing/ui/LandingPage';
import { LiveHostPage } from '@pages/LiveHost/ui/LiveHostPage';
import { LoginPage } from '@pages/Login/ui/LoginPage';
import { NotFoundPage } from '@pages/NotFound/ui/NotFoundPage';
import { OrganizerAccountPage } from '@pages/OrganizerAccount/ui/OrganizerAccountPage';
import { OrganizerDashboard } from '@pages/OrganizerDashboard/ui/OrganizerDashboard';
import { ParticipantAccountPage } from '@pages/ParticipantAccount/ui/ParticipantAccountPage';
import { ParticipantJoinPage } from '@pages/ParticipantJoin/ui/ParticipantJoinPage';
import { ParticipantLivePage } from '@pages/ParticipantLive/ui/ParticipantLivePage';
import { PrivacyPage } from '@pages/Privacy/ui/PrivacyPage';
import { QuizBuilderPage } from '@pages/QuizBuilder/ui/QuizBuilderPage';
import { QuizSettingsPage } from '@pages/QuizSettings/ui/QuizSettingsPage';
import { ResultsPage } from '@pages/Results/ui/ResultsPage';
import { SignUpPage } from '@pages/SignUp/ui/SignUpPage';
import { TermsPage } from '@pages/Terms/ui/TermsPage';
import { ROUTES } from '@shared/config/routes';
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
    { path: ROUTES.LANDING, element: <LandingPage /> },
    { path: ROUTES.LOGIN, element: <LoginPage /> },
    { path: ROUTES.SIGNUP, element: <SignUpPage /> },
    { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
    { path: ROUTES.ABOUT, element: <AboutPage /> },
    { path: ROUTES.PRIVACY, element: <PrivacyPage /> },
    { path: ROUTES.TERMS, element: <TermsPage /> },
    { path: ROUTES.ORGANIZER_DASHBOARD, element: <OrganizerDashboard /> },
    { path: ROUTES.ORGANIZER_QUIZ_NEW, element: <QuizBuilderPage /> },
    { path: ROUTES.ORGANIZER_QUIZ_EDIT(':id'), element: <QuizBuilderPage /> },
    { path: ROUTES.ORGANIZER_QUIZ_SETTINGS(':id'), element: <QuizSettingsPage /> },
    { path: ROUTES.ORGANIZER_QUIZ_LIVE(':id'), element: <LiveHostPage /> },
    { path: ROUTES.ORGANIZER_ACCOUNT, element: <OrganizerAccountPage /> },
    { path: ROUTES.PARTICIPANT_JOIN, element: <ParticipantJoinPage /> },
    { path: ROUTES.PARTICIPANT_LIVE(':roomCode'), element: <ParticipantLivePage /> },
    { path: ROUTES.PARTICIPANT_RESULTS(':roomCode'), element: <ResultsPage /> },
    { path: ROUTES.PARTICIPANT_ACCOUNT, element: <ParticipantAccountPage /> },
    { path: '*', element: <NotFoundPage /> },
]);
