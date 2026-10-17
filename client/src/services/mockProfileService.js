import { MOCK_CURRENT_USER } from '../data/mockUsers';
import { MOCK_USER_PREFERENCES } from '../data/mockPreferences';

/**
 * Mock Profile Service
 * Manages student biography, university specifics, and lifestyle preferences.
 */

export const mockProfileService = {
  getProfile: (userId = 'user-me') => {
    return {
      user: MOCK_CURRENT_USER,
      preferences: MOCK_USER_PREFERENCES[userId] || MOCK_USER_PREFERENCES['user-me'],
    };
  },

  updateProfile: (updatedData) => {
    return {
      success: true,
      data: updatedData,
    };
  },
};
