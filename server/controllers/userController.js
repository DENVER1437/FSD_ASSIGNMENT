import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Authoritative Profile Completeness Evaluator.
 * Profile is complete when all essential student fields are populated with non-trivial values.
 * @param {object} user - User document or profile object
 * @returns {boolean} True if profile meets complete criteria, false otherwise
 */
export const checkProfileCompleteness = (user) => {
  if (!user) return false;

  const hasName = typeof user.name === 'string' && user.name.trim().length >= 2;
  const hasCollege = typeof user.college === 'string' && user.college.trim().length >= 2;
  const hasCourse = typeof user.course === 'string' && user.course.trim().length >= 2;
  const hasCity = typeof user.city === 'string' && user.city.trim().length >= 2;
  const hasBio = typeof user.bio === 'string' && user.bio.trim().length >= 10;

  return Boolean(hasName && hasCollege && hasCourse && hasCity && hasBio);
};

/**
 * @desc    Get profile of currently logged-in user
 * @route   GET /api/users/profile
 * @access  Private (JWT)
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }
  return sendSuccess(res, { user: user.toSafeObject() }, 'Profile retrieved');
});

/**
 * @desc    Update current user's profile information
 * @route   PUT /api/users/profile
 * @access  Private (JWT)
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'college', 'city', 'course', 'bio', 'profileImage'];
  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Prevent mass-assignment: restrict strictly to whitelisted profile fields
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
    }
  });

  // Re-evaluate profile completeness (transition from complete -> incomplete -> complete)
  user.isProfileComplete = checkProfileCompleteness(user);

  await user.save();

  return sendSuccess(res, { user: user.toSafeObject() }, 'Profile updated successfully');
});

/**
 * @desc    Get public profile of another student
 * @route   GET /api/users/:id
 * @access  Private (JWT)
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.status === 'suspended') {
    return sendError(res, 'Student profile not found or inactive', 404);
  }

  return sendSuccess(res, { user: user.toSafeObject() }, 'Student profile retrieved');
});
