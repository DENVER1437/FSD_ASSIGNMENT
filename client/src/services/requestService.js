import api from './api';

export const requestService = {
  sendRequest: async (receiverId, message) => {
    const response = await api.post('/requests', { receiverId, message });
    return response.data;
  },

  getReceivedRequests: async () => {
    const response = await api.get('/requests/received');
    return response.data;
  },

  getSentRequests: async () => {
    const response = await api.get('/requests/sent');
    return response.data;
  },

  acceptRequest: async (requestId) => {
    const response = await api.put(`/requests/${requestId}/accept`);
    return response.data;
  },

  rejectRequest: async (requestId) => {
    const response = await api.put(`/requests/${requestId}/reject`);
    return response.data;
  },

  cancelRequest: async (requestId) => {
    const response = await api.delete(`/requests/${requestId}`);
    return response.data;
  },
};

export default requestService;
