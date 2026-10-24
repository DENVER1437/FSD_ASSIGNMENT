import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { matchService } from '../services/matchService';
import { requestService } from '../services/requestService';
import { preferenceService } from '../services/preferenceService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const MatchContext = createContext(null);

export function MatchProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState(null);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

  const [preferences, setPreferences] = useState(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [preferencesError, setPreferencesError] = useState(null);

  const [loading, setLoading] = useState(false);

  // Fetch lifestyle preferences
  const fetchPreferences = useCallback(async () => {
    setPreferencesLoading(true);
    setPreferencesError(null);
    try {
      const res = await preferenceService.getMyPreferences();
      if (res.data?.preferences) {
        setPreferences(res.data.preferences);
        return res.data.preferences;
      }
      setPreferences(null);
      return null;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load preferences.';
      console.error('[MatchContext] Error loading preferences:', msg);
      setPreferencesError(msg);
      setPreferences(null);
      return null;
    } finally {
      setPreferencesLoading(false);
    }
  }, []);

  // Fetch candidate matches
  const fetchMatches = useCallback(async (filters = {}) => {
    setMatchesLoading(true);
    setMatchesError(null);
    try {
      const res = await matchService.getMatches(filters);
      if (res.data?.matches) {
        setMatches(res.data.matches);
        return res.data.matches;
      }
      setMatches([]);
      return [];
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load roommate matches.';
      console.error('[MatchContext] Error loading matches:', msg);
      setMatchesError(msg);
      setMatches([]);
      return [];
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  // Fetch all roommate requests (received + sent)
  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError(null);
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
      const msg = err.response?.data?.message || err.message || 'Failed to load requests.';
      console.error('[MatchContext] Error loading requests:', msg);
      setRequestsError(msg);
      setRequests([]);
      return [];
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  // Synchronize on authentication change
  useEffect(() => {
    if (!isAuthenticated) {
      setMatches([]);
      setRequests([]);
      setPreferences(null);
      setMatchesError(null);
      setRequestsError(null);
      setPreferencesError(null);
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
  }, [isAuthenticated, fetchPreferences, fetchMatches, fetchRequests]);

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
  // Accept an incoming request
  const acceptRequest = async (requestId) => {
    try {
      const res = await requestService.acceptRequest(requestId);
      await fetchRequests();
      showToast(res.message || 'Roommate request accepted! Roommate connection confirmed.', 'success');
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

  // Save lifestyle questionnaire answers
  const submitQuestionnaire = async (answers) => {
    try {
      const res = await preferenceService.updateMyPreferences(answers);
      if (res.data?.preferences) {
        setPreferences(res.data.preferences);
      }
      // Re-calculate matches with updated preferences
      await fetchMatches();
      return { success: true, preferences: res.data?.preferences };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save questionnaire.';
      return { success: false, message: msg };
    }
  };

  return (
    <MatchContext.Provider
      value={{
        matches,
        matchesLoading,
        matchesError,
        requests,
        requestsLoading,
        requestsError,
        preferences,
        preferencesLoading,
        preferencesError,
        loading,
        fetchMatches,
        refreshMatches: fetchMatches,
        fetchRequests,
        fetchPreferences,
        sendRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
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
