import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

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
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Calculate completeness flag
  const user = await User.findById(req.user._id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  Object.assign(user, updates);
  if (user.college && user.course && user.city && user.bio) {
    user.isProfileComplete = true;
  }

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
