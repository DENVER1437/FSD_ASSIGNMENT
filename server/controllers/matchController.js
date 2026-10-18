import { User } from '../models/User.js';
import { Preference } from '../models/Preference.js';
import { calculateCompatibility } from '../services/matchingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @desc    Get algorithmically ranked list of compatible roommates
 * @route   GET /api/matches
 * @access  Private (JWT)
 */
export const getMatches = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  // 1. Fetch current user's preferences
  const myPref = await Preference.findOne({ userId: currentUserId });

  // 2. Fetch candidate students (exclude self, non-students, and suspended users)
  const candidates = await User.find({
    _id: { $ne: currentUserId },
    role: 'student',
    status: 'active',
  });

  if (candidates.length === 0) {
    return sendSuccess(res, { matches: [] }, 'No candidate students found');
  }

  // 3. Fetch candidate preferences in batch
  const candidateIds = candidates.map((c) => c._id);
  const candidatePrefs = await Preference.find({ userId: { $in: candidateIds } });
  const prefMap = new Map();
  candidatePrefs.forEach((p) => prefMap.set(p.userId.toString(), p));

  // 4. Calculate compatibility for each candidate
  let matches = candidates.map((candidate) => {
    const candidatePref = prefMap.get(candidate._id.toString());
    const matchResult = calculateCompatibility(myPref, candidatePref, req.user, candidate);

    return {
      id: `match-${candidate._id.toString()}`,
      userId: candidate._id.toString(),
      user: candidate.toSafeObject(),
      score: matchResult.score,
      compatibilityScore: matchResult.score,
      compatibilityLevel: matchResult.compatibilityLevel,
      commonPreferences: matchResult.commonPreferences,
      differences: matchResult.differences,
      categoryBreakdown: matchResult.categoryBreakdown,
    };
  });

  // 5. Apply query filters
  const { search, college, city, minScore, sortBy } = req.query;

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    matches = matches.filter(
      (m) =>
        m.user.name.toLowerCase().includes(q) ||
        (m.user.college && m.user.college.toLowerCase().includes(q)) ||
        (m.user.course && m.user.course.toLowerCase().includes(q))
    );
  }

  if (college && college !== 'all') {
    matches = matches.filter(
      (m) => m.user.college && m.user.college.toLowerCase().includes(college.toLowerCase())
    );
  }

  if (city && city !== 'all') {
    matches = matches.filter(
      (m) => m.user.city && m.user.city.toLowerCase() === city.toLowerCase()
    );
  }

  if (minScore) {
    const threshold = Number(minScore);
    if (!isNaN(threshold)) {
      matches = matches.filter((m) => m.score >= threshold);
    }
  }

  // 6. Sorting
  if (sortBy === 'name') {
    matches.sort((a, b) => a.user.name.localeCompare(b.user.name));
  } else {
    // Default to highest compatibility score
    matches.sort((a, b) => b.score - a.score);
  }

  return sendSuccess(res, { matches, total: matches.length }, 'Matches calculated successfully');
});

/**
 * @desc    Get detailed compatibility breakdown with a specific candidate
 * @route   GET /api/matches/:id
 * @access  Private (JWT)
 */
export const getMatchDetails = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  let targetId = req.params.id;
  if (targetId && targetId.startsWith('match-')) {
    targetId = targetId.replace('match-', '');
  }

  if (currentUserId.toString() === targetId) {
    return sendError(res, 'Cannot inspect compatibility with yourself', 400);
  }

  const candidate = await User.findById(targetId);
  if (!candidate || candidate.status === 'suspended') {
    return sendError(res, 'Candidate student not found or inactive', 404);
  }

  const [myPref, candidatePref] = await Promise.all([
    Preference.findOne({ userId: currentUserId }),
    Preference.findOne({ userId: targetId }),
  ]);

  const matchResult = calculateCompatibility(myPref, candidatePref, req.user, candidate);

  const matchData = {
    id: `match-${candidate._id.toString()}`,
    userId: candidate._id.toString(),
    user: candidate.toSafeObject(),
    score: matchResult.score,
    compatibilityLevel: matchResult.compatibilityLevel,
    commonPreferences: matchResult.commonPreferences,
    differences: matchResult.differences,
    categoryBreakdown: matchResult.categoryBreakdown,
  };

  return sendSuccess(res, { match: matchData }, 'Match details retrieved successfully');
});
