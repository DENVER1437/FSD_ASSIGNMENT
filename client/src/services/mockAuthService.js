import { MOCK_CURRENT_USER, MOCK_ADMIN_USER } from '../data/mockUsers';

/**
 * Mock Authentication Service
 * Simulates client login, session hydration, and registration states.
 * NOTE: UI Demo only. Real JWT authentication is deferred to Phase 4.
 */

export const mockAuthService = {
  login: async (email, password) => {
    // Check if logging in as demo admin
    if (email === 'admin@nestmatch.internal') {
      return { success: true, user: MOCK_ADMIN_USER, role: 'admin' };
    }
    // Default student mock login
    return {
      success: true,
      user: {
        ...MOCK_CURRENT_USER,
        email: email || MOCK_CURRENT_USER.email,
      },
      role: 'student',
    };
  },

  register: async (formData) => {
    const newUser = {
      ...MOCK_CURRENT_USER,
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      college: formData.college,
      city: formData.city,
      questionnaireCompleted: false,
    };
    return { success: true, user: newUser, role: 'student' };
  },

  getCurrentUser: () => {
    return MOCK_CURRENT_USER;
  },

  logout: async () => {
    return { success: true };
  },
};
