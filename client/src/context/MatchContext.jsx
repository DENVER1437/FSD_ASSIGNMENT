import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { matchService } from '../services/matchService';
import { requestService } from '../services/requestService';
import { chatService } from '../services/chatService';
import { preferenceService } from '../services/preferenceService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const MatchContext = createContext(null);

export function MatchProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch lifestyle preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const res = await preferenceService.getMyPreferences();
      if (res.data?.preferences) {
        setPreferences(res.data.preferences);
        return res.data.preferences;
      }
    } catch (err) {
      console.error('[MatchContext] Error loading preferences:', err.message);
    }
    return null;
  }, []);

  // Fetch candidate matches
  const fetchMatches = useCallback(async (filters = {}) => {
    try {
      const res = await matchService.getMatches(filters);
      if (res.data?.matches) {
        setMatches(res.data.matches);
        return res.data.matches;
      }
    } catch (err) {
      console.error('[MatchContext] Error loading matches:', err.message);
    }
    return [];
  }, []);

  // Fetch all roommate requests (received + sent)
  const fetchRequests = useCallback(async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        requestService.getReceivedRequests(),
        requestService.getSentRequests(),
      ]);

      const received = (receivedRes.data?.requests || []).map((r) => ({
        ...r,
        type: 'received',
      }));

      const sent = (sentRes.data?.requests || []).map((r) => ({
        ...r,
        type: 'sent',
      }));

      const combined = [...received, ...sent];
      setRequests(combined);
      return combined;
    } catch (err) {
      console.error('[MatchContext] Error loading requests:', err.message);
      return [];
    }
  }, []);

  // Fetch conversations and message threads
  const fetchConversations = useCallback(async () => {
    try {
      const res = await chatService.getConversations();
      const convList = res.data?.conversations || [];

      // For each conversation, ensure message thread is accessible
      const populated = await Promise.all(
        convList.map(async (conv) => {
          try {
            const msgRes = await chatService.getMessages(conv.userId);
            return {
              ...conv,
              messages: msgRes.data?.messages || [],
            };
          } catch {
            return {
              ...conv,
              messages: [],
            };
          }
        })
      );

      setConversations(populated);
      return populated;
    } catch (err) {
      console.error('[MatchContext] Error loading conversations:', err.message);
      return [];
    }
  }, []);

  // Synchronize on authentication change
  useEffect(() => {
    if (!isAuthenticated) {
      setMatches([]);
      setRequests([]);
      setConversations([]);
      setPreferences(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const initUserData = async () => {
      try {
        await Promise.all([
          fetchPreferences(),
          fetchMatches(),
          fetchRequests(),
          fetchConversations(),
        ]);
      } catch (err) {
        console.error('[MatchContext] Synchronization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initUserData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, fetchPreferences, fetchMatches, fetchRequests, fetchConversations]);

  // Send a roommate request to a candidate
  const sendRequest = async (matchUser, customMessage = '') => {
    const targetUserId = matchUser._id || matchUser.id || matchUser.userId;
    if (!targetUserId) {
      showToast('Invalid student selected for request.', 'error');
      return false;
    }

    try {
      const res = await requestService.sendRequest(targetUserId, customMessage);
      await fetchRequests();
      showToast(res.message || `Roommate request sent to ${matchUser.name}!`, 'success');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send roommate request.';
      showToast(msg, 'error');
      return false;
    }
  };

  // Accept an incoming request
  const acceptRequest = async (requestId) => {
    try {
      const res = await requestService.acceptRequest(requestId);
      await Promise.all([fetchRequests(), fetchConversations()]);
      showToast(res.message || 'Roommate request accepted! Chat unlocked.', 'success');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to accept request.';
      showToast(msg, 'error');
      return false;
    }
  };

  // Reject an incoming request
  const rejectRequest = async (requestId) => {
    try {
      const res = await requestService.rejectRequest(requestId);
      await fetchRequests();
      showToast(res.message || 'Roommate request declined.', 'info');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to decline request.';
      showToast(msg, 'error');
      return false;
    }
  };

  // Cancel an outgoing pending request
  const cancelRequest = async (requestId) => {
    try {
      await requestService.cancelRequest(requestId);
      await fetchRequests();
      showToast('Roommate request canceled.', 'info');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel request.';
      showToast(msg, 'error');
      return false;
    }
  };

  // Send a message in a conversation thread
  const sendMessage = async (conversationIdOrUserId, text) => {
    if (!text || !text.trim()) return false;

    // Resolve recipient user ID
    let receiverId = conversationIdOrUserId;
    const matchedConv = conversations.find((c) => c.id === conversationIdOrUserId);
    if (matchedConv) {
      receiverId = matchedConv.userId;
    }

    try {
      const res = await chatService.sendMessage(receiverId, text.trim());
      const sentMsg = res.data?.message;

      // Update state immediately with sent message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.userId === receiverId || c.id === conversationIdOrUserId) {
            return {
              ...c,
              lastMessage: text.trim(),
              lastMessageTime: 'Just now',
              messages: [...(c.messages || []), sentMsg],
            };
          }
          return c;
        })
      );

      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send message.';
      showToast(msg, 'error');
      return false;
    }
  };

  // Save lifestyle questionnaire answers
  const submitQuestionnaire = async (answers) => {
    try {
      const res = await preferenceService.updateMyPreferences(answers);
      if (res.data?.preferences) {
        setPreferences(res.data.preferences);
      }
      // Re-calculate matches with updated preferences
      await fetchMatches();
      showToast('Lifestyle questionnaire saved! Compatibility scores updated.', 'success');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save questionnaire.';
      showToast(msg, 'error');
      return false;
    }
  };

  return (
    <MatchContext.Provider
      value={{
        matches,
        requests,
        conversations,
        preferences,
        loading,
        fetchMatches,
        fetchRequests,
        fetchConversations,
        fetchPreferences,
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

export default MatchContext;
