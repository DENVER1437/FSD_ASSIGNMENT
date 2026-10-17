import { createContext, useContext, useState } from 'react';
import { MOCK_MATCHES } from '../data/mockMatches';
import { MOCK_REQUESTS } from '../data/mockRequests';
import { MOCK_CONVERSATIONS } from '../data/mockMessages';
import { MOCK_USER_PREFERENCES } from '../data/mockPreferences';
import { useToast } from './ToastContext';

const MatchContext = createContext(null);

export function MatchProvider({ children }) {
  const { showToast } = useToast();
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [preferences, setPreferences] = useState(MOCK_USER_PREFERENCES['user-me']);

  // Send a roommate request to a candidate
  const sendRequest = (matchUser, customMessage = '') => {
    // Check if request already exists
    const existing = requests.find(
      (r) => (r.receiverId === matchUser.id || r.senderId === matchUser.id) && r.status !== 'rejected'
    );
    if (existing) {
      showToast('A request is already active with this student.', 'info');
      return false;
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      senderId: 'user-me',
      receiverId: matchUser.id,
      receiver: matchUser,
      status: 'pending',
      type: 'sent',
      message: customMessage || 'Hey! Saw our high compatibility score on NestMatch. Would love to connect!',
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    showToast(`Roommate request sent to ${matchUser.name}!`, 'success');
    return true;
  };

  // Accept an incoming request
  const acceptRequest = (requestId) => {
    let acceptedUser = null;
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          acceptedUser = req.sender || req.receiver;
          return { ...req, status: 'accepted', type: 'accepted', updatedAt: new Date().toISOString() };
        }
        return req;
      })
    );

    // Create or unlock conversation thread for newly connected pair
    if (acceptedUser) {
      setConversations((prev) => {
        const existingConv = prev.find((c) => c.userId === acceptedUser.id);
        if (existingConv) return prev;

        const newConversation = {
          id: `conv-${acceptedUser.id}`,
          userId: acceptedUser.id,
          user: {
            id: acceptedUser.id,
            name: acceptedUser.name,
            college: acceptedUser.college,
            profileImage: acceptedUser.profileImage,
            status: 'online',
          },
          lastMessage: 'Roommate request accepted. Start your conversation!',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          messages: [
            {
              id: `msg-${Date.now()}`,
              senderId: 'system',
              text: `You and ${acceptedUser.name} are now connected! Say hello to discuss housing.`,
              timestamp: 'Just now',
              isSystem: true,
            },
          ],
        };
        return [newConversation, ...prev];
      });
      showToast(`Accepted roommate request from ${acceptedUser.name}! Chat unlocked.`, 'success');
    }
  };

  // Reject an incoming request
  const rejectRequest = (requestId) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'rejected' } : req))
    );
    showToast('Roommate request declined.', 'info');
  };

  // Cancel an outgoing pending request
  const cancelRequest = (requestId) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
    showToast('Request canceled.', 'info');
  };

  // Send a message in a chat conversation
  const sendMessage = (conversationId, text) => {
    if (!text.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-me',
      text: text.trim(),
      timestamp: 'Just now',
      isMe: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text.trim(),
            lastMessageTime: 'Just now',
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      })
    );
  };

  // Submit lifestyle questionnaire
  const submitQuestionnaire = (answers) => {
    setPreferences((prev) => ({
      ...prev,
      ...answers,
    }));
    showToast('Lifestyle questionnaire saved! Compatibility scores updated.', 'success');
  };

  return (
    <MatchContext.Provider
      value={{
        matches,
        requests,
        conversations,
        preferences,
        sendRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        sendMessage,
        submitQuestionnaire,
        setPreferences,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}

export function useMatch() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within MatchProvider');
  }
  return context;
}
