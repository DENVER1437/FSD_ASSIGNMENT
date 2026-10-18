import api from './api';

export const userService = {
  getMyProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateMyProfile: async (updates) => {
    const response = await api.put('/users/profile', updates);
    return response.data;
  },

  updateMySettings: async (settings) => {
    const response = await api.put('/users/settings', settings);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

export default userService;
