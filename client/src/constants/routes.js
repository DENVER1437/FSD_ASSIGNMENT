/**
 * NestMatch Route Path Definitions
 * Aligned with Section 9 Routing Architecture
 */
export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Student Protected Routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  QUESTIONNAIRE: '/questionnaire',
  MATCHES: '/matches',
  MATCH_DETAILS: '/matches/:id',
  REQUESTS: '/requests',
  SETTINGS: '/settings',

  // Admin Protected Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
};
