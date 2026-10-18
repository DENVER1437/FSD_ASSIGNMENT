import api from './api';

export const matchService = {
  getMatches: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.college && filters.college !== 'all') params.append('college', filters.college);
    if (filters.city && filters.city !== 'all') params.append('city', filters.city);
    if (filters.minScore) params.append('minScore', filters.minScore);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    const url = queryString ? `/matches?${queryString}` : '/matches';
    const response = await api.get(url);
    return response.data;
  },

  getMatchDetails: async (candidateId) => {
    const response = await api.get(`/matches/${candidateId}`);
    return response.data;
  },
};

export default matchService;
