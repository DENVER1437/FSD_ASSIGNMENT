import { MOCK_MATCHES } from '../data/mockMatches';

/**
 * Mock Match Service
 * Supports querying candidate roommate records, filtering by lifestyle, and sorting.
 */

export const mockMatchService = {
  getMatches: (filters = {}, sortBy = 'compatibility') => {
    let result = [...MOCK_MATCHES];

    // Filter by college
    if (filters.college && filters.college !== 'all') {
      result = result.filter(m => m.user.college.toLowerCase().includes(filters.college.toLowerCase()));
    }

    // Filter by city
    if (filters.city && filters.city !== 'all') {
      result = result.filter(m => m.user.city.toLowerCase() === filters.city.toLowerCase());
    }

    // Filter by minimum compatibility score
    if (filters.minScore) {
      result = result.filter(m => m.score >= Number(filters.minScore));
    }

    // Sorting
    if (sortBy === 'compatibility') {
      result.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.user.name.localeCompare(b.user.name));
    }

    return result;
  },

  getMatchById: (id) => {
    return MOCK_MATCHES.find(m => m.id === id || m.userId === id);
  },
};
