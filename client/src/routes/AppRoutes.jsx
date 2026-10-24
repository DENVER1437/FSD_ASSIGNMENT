import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Guards
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';

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

      {/* Auth Pages (redirect if already logged in) */}
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Student Protected Layout */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
        <Route element={<StudentLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.QUESTIONNAIRE} element={<QuestionnairePage />} />
          <Route path={ROUTES.MATCHES} element={<MatchesPage />} />
          <Route path={ROUTES.MATCH_DETAILS} element={<MatchDetailsPage />} />
          <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
          <Route path={ROUTES.CHAT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Admin Protected Layout (Admin Only) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReportsPage />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

