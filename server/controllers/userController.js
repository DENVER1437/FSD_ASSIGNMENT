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
  const allowedFields = ['name', 'college', 'city', 'course', 'bio', 'profileImage', 'age'];
  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Validate age if provided
  if (req.body.age !== undefined && req.body.age !== null && req.body.age !== '') {
    const ageNum = Number(req.body.age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 99) {
      return sendError(res, 'Age must be a valid number between 16 and 99', 400);
    }
    user.age = Math.floor(ageNum);
  } else if (req.body.age === null || req.body.age === '') {
    user.age = null;
  }

  // Prevent mass-assignment: restrict strictly to whitelisted profile fields
  allowedFields.forEach((field) => {
    if (field !== 'age' && req.body[field] !== undefined) {
      user[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
    }
  });

  // Re-evaluate profile completeness (transition from complete -> incomplete -> complete)
  user.isProfileComplete = checkProfileCompleteness(user);

  await user.save();

  return sendSuccess(res, { user: user.toSafeObject() }, 'Profile updated successfully');
});

/**
 * @desc    Update current user's notification and privacy settings
 * @route   PUT /api/users/settings
 * @access  Private (JWT)
 */
export const updateMySettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  const allowedSettings = [
    'emailNotifications',
    'matchAlerts',
    'requestAlerts',
    'chatNotifications',
    'hideBudgetFromPublic',
  ];

  for (const key of allowedSettings) {
    if (req.body[key] !== undefined && typeof req.body[key] !== 'boolean') {
      return sendError(res, `Setting '${key}' must be a boolean value`, 400);
    }
  }

  if (!user.settings) {
    user.settings = {};
  }

  allowedSettings.forEach((key) => {
    if (typeof req.body[key] === 'boolean') {
      user.settings[key] = req.body[key];
    }
  });

  user.markModified('settings');
  await user.save();

  return sendSuccess(
    res,
    { settings: user.toSafeObject().settings, user: user.toSafeObject() },
    'Settings updated successfully'
  );
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
