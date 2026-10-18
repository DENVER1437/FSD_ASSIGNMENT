import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (formData) => {
    const response = await api.post('/auth/register', formData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignored if token expired
    } finally {
      localStorage.removeItem('nestmatch_token');
      localStorage.removeItem('nestmatch_user');
    }
  },
};

export default authService;
