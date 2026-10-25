import api from './api';

export const adminService = {
  getMetrics: async () => {
    const response = await api.get('/admin/metrics');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'all') query.append('role', params.role);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
    const response = await api.get(url);
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getReports: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);

    const queryString = query.toString();
    const url = queryString ? `/admin/reports?${queryString}` : '/admin/reports';
    const response = await api.get(url);
    return response.data;
  },

  updateReportStatus: async (reportId, data) => {
    const response = await api.put(`/admin/reports/${reportId}`, data);
    return response.data;
  },

  getAcceptedPairs: async () => {
    const response = await api.get('/admin/accepted-pairs');
    return response.data;
  },
};

export default adminService;
