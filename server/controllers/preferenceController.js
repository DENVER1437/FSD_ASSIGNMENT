import { Preference } from '../models/Preference.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @desc    Get current user's lifestyle questionnaire responses
 * @route   GET /api/preferences
 * @access  Private (JWT)
 */
export const getMyPreferences = asyncHandler(async (req, res) => {
  let preferences = await Preference.findOne({ userId: req.user._id });

  if (!preferences) {
    // Return standard defaults if user hasn't completed questionnaire yet
    preferences = {
      userId: req.user._id,
      sleepSchedule: 'flexible',
      wakeUpSchedule: '7am_9am',
      productivityRhythm: 'evening',
      cleanliness: 'moderate',
      choreSharing: 'strict_rotation',
      roomComfort: 'moderate',
      studyHabit: 'in_room_quiet',
      noisePreference: 'moderate',
      weekendRoutine: 'relax_and_code',
      socialLevel: 'ambivert',
      guestPreference: 'occasional_guests',
      smokingPreference: 'strictly_non_smoker',
      budget: '5000-8000',
      foodPreference: 'any',
      preferredLocation: 'University District',
    };
  }

  return sendSuccess(res, { preferences }, 'Lifestyle preferences retrieved');
});

/**
 * @desc    Create or update current user's lifestyle questionnaire responses
 * @route   PUT /api/preferences
 * @access  Private (JWT)
 */
export const updateMyPreferences = asyncHandler(async (req, res) => {
  const allowedFields = [
    'sleepSchedule',
    'wakeUpSchedule',
    'productivityRhythm',
    'cleanliness',
    'choreSharing',
    'roomComfort',
    'studyHabit',
    'noisePreference',
    'weekendRoutine',
    'socialLevel',
    'guestPreference',
    'smokingPreference',
    'budget',
    'foodPreference',
    'preferredLocation',
  ];

  const updates = {};

  // Alias mappings from alternate client representations
  if (req.body.noiseTolerance !== undefined && req.body.noisePreference === undefined) {
    updates.noisePreference = req.body.noiseTolerance;
  }
  if (req.body.socialHabit !== undefined && req.body.socialLevel === undefined) {
    updates.socialLevel = req.body.socialHabit;
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const preferences = await Preference.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );

  // Update user profile status
  await User.findByIdAndUpdate(req.user._id, { isProfileComplete: true });

  return sendSuccess(res, { preferences }, 'Lifestyle questionnaire saved successfully');
});
