import api from './api';

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (otherUserId) => {
    const response = await api.get(`/messages/${otherUserId}`);
    return response.data;
  },

  sendMessage: async (receiverId, message) => {
    const response = await api.post('/messages', { receiverId, message });
    return response.data;
  },
};

export default chatService;
