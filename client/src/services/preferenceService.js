import api from './api';

export const preferenceService = {
  getMyPreferences: async () => {
    const response = await api.get('/preferences');
    return response.data;
  },

  updateMyPreferences: async (preferences) => {
    const response = await api.put('/preferences', preferences);
    return response.data;
  },
};

export default preferenceService;
