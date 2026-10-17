import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Student Pages
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import QuestionnairePage from '../pages/QuestionnairePage';
import MatchesPage from '../pages/MatchesPage';
import MatchDetailsPage from '../pages/MatchDetailsPage';
import RequestsPage from '../pages/RequestsPage';
import ChatPage from '../pages/ChatPage';
import SettingsPage from '../pages/SettingsPage';

// Admin Pages
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminReportsPage from '../pages/AdminReportsPage';

// Fallback
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Student Protected Layout */}
      <Route element={<StudentLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.QUESTIONNAIRE} element={<QuestionnairePage />} />
        <Route path={ROUTES.MATCHES} element={<MatchesPage />} />
        <Route path={ROUTES.MATCH_DETAILS} element={<MatchDetailsPage />} />
        <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
        <Route path={ROUTES.CHAT} element={<ChatPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Route>

      {/* Admin Protected Layout */}
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
        <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
        <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
