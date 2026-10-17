import { MOCK_REQUESTS } from '../data/mockRequests';

/**
 * Mock Request Service
 * Handles peer-to-peer roommate requests and connection transitions.
 */

export const mockRequestService = {
  getRequests: () => {
    return [...MOCK_REQUESTS];
  },

  sendRequest: (receiver, message = '') => {
    return {
      id: `req-${Date.now()}`,
      senderId: 'user-me',
      receiverId: receiver.id,
      receiver,
      status: 'pending',
      type: 'sent',
      message: message || 'Hi! Let us connect to discuss room options.',
      createdAt: new Date().toISOString(),
    };
  },
};
