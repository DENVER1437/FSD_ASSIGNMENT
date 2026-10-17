import { MOCK_CONVERSATIONS } from '../data/mockMessages';

/**
 * Mock Chat Service
 * Simulates direct messaging between accepted roommates.
 */

export const mockChatService = {
  getConversations: () => {
    return [...MOCK_CONVERSATIONS];
  },

  sendMessage: (conversationId, text) => {
    return {
      id: `msg-${Date.now()}`,
      senderId: 'user-me',
      text,
      timestamp: 'Just now',
      isMe: true,
    };
  },
};
