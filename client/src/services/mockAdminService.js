import { MOCK_STUDENTS } from '../data/mockUsers';
import { MOCK_REPORTS } from '../data/mockReports';
import { MOCK_REQUESTS } from '../data/mockRequests';

/**
 * Mock Admin Service
 * Provides administrator telemetry, student account management, and report moderation.
 */

export const mockAdminService = {
  getStats: () => {
    return {
      totalUsers: MOCK_STUDENTS.length + 1, // Including demo user
      activeUsers: MOCK_STUDENTS.filter(s => s.status !== 'flagged').length + 1,
      pendingRequests: MOCK_REQUESTS.filter(r => r.status === 'pending').length,
      openReports: MOCK_REPORTS.filter(r => r.status === 'pending').length,
    };
  },

  getUsers: () => {
    return [...MOCK_STUDENTS];
  },

  getReports: () => {
    return [...MOCK_REPORTS];
  },
};
