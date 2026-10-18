import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    compatibilityLevel: {
      type: String,
      default: 'Moderate Match',
    },
    commonPreferences: {
      type: [String],
      default: [],
    },
    differences: {
      type: [String],
      default: [],
    },
    categoryBreakdown: [
      {
        name: { type: String, required: true },
        score: { type: Number, required: true },
        status: { type: String, default: 'Good' },
        note: { type: String, default: '' },
      },
    ],
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of user pairs
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });

export const Match = mongoose.model('Match', matchSchema);
export default Match;
