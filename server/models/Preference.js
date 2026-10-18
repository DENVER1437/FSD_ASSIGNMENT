import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Sleep & Morning Rhythms
    sleepSchedule: {
      type: String,
      enum: ['early_bird', 'night_owl', 'flexible'],
      default: 'flexible',
    },
    wakeUpSchedule: {
      type: String,
      enum: ['before_7am', '7am_9am', 'after_9am'],
      default: '7am_9am',
    },
    productivityRhythm: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'evening',
    },
    // Cleanliness & Chores
    cleanliness: {
      type: String,
      enum: ['meticulous', 'moderate', 'moderately_clean', 'clean', 'relaxed'],
      default: 'moderate',
    },
    choreSharing: {
      type: String,
      enum: ['strict_rotation', 'as_needed', 'hire_help', 'clean_as_you_go', 'hire_cleaner', 'flexible_sharing'],
      default: 'strict_rotation',
    },
    roomComfort: {
      type: String,
      enum: ['cool', 'moderate', 'warm'],
      default: 'moderate',
    },
    // Atmosphere & Study
    studyHabit: {
      type: String,
      enum: ['in_room_quiet', 'in_room_collaborative', 'in_room_music', 'library_study', 'intense_study'],
      default: 'in_room_quiet',
    },
    noisePreference: {
      type: String,
      enum: ['silent', 'moderate', 'lively', 'tolerant', 'low', 'high'],
      default: 'moderate',
    },
    weekendRoutine: {
      type: String,
      enum: [
        'relax_and_code',
        'social_and_out',
        'reading_and_study',
        'outdoors',
        'hybrid',
        'gaming_and_relax',
        'outdoor_sports',
        'social_hangouts',
        'parties_and_cooking',
        'sports_and_trips',
      ],
      default: 'relax_and_code',
    },
    // Social & House Rules
    socialLevel: {
      type: String,
      enum: ['introvert', 'ambivert', 'extrovert'],
      default: 'ambivert',
    },
    guestPreference: {
      type: String,
      enum: ['no_overnight_guests', 'occasional_guests', 'frequent_guests', 'open_house'],
      default: 'occasional_guests',
    },
    smokingPreference: {
      type: String,
      enum: ['strictly_non_smoker', 'outdoor_only', 'outside_only', 'smoker_friendly', 'tolerant'],
      default: 'strictly_non_smoker',
    },
    // Budget & Dietary
    budget: {
      type: String,
      enum: ['<5000', 'under_5000', '5000-8000', '8000-12000', '12000+', 'above_12000'],
      default: '5000-8000',
    },
    foodPreference: {
      type: String,
      enum: ['vegetarian', 'non_vegetarian', 'vegan', 'eggetarian', 'any'],
      default: 'any',
    },
    preferredLocation: {
      type: String,
      trim: true,
      default: 'University District',
    },
  },
  {
    timestamps: true,
  }
);

export const Preference = mongoose.model('Preference', preferenceSchema);
export default Preference;
