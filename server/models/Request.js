import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [300, 'Message cannot exceed 300 characters'],
      default: 'Hey! Saw our compatibility score on NestMatch. Would love to connect!',
    },
    // Normalized pair key for concurrency-safe active request uniqueness
    activePairKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Concurrency-safe partial unique index: Only active (pending or accepted) requests must be unique per unordered pair
requestSchema.index(
  { activePairKey: 1 },
  {
    unique: true,
    partialFilterExpression: { activePairKey: { $type: 'string' } },
  }
);

// Indexes for query performance
requestSchema.index({ senderId: 1, status: 1 });
requestSchema.index({ receiverId: 1, status: 1 });

// Prevent self-request
requestSchema.pre('validate', function (next) {
  if (this.senderId && this.receiverId && this.senderId.toString() === this.receiverId.toString()) {
    this.invalidate('receiverId', 'You cannot send a roommate request to yourself');
  }

  // Compute activePairKey if request is active (pending or accepted)
  if (this.senderId && this.receiverId && (this.status === 'pending' || this.status === 'accepted')) {
    this.activePairKey = [this.senderId.toString(), this.receiverId.toString()].sort().join(':');
  } else {
    this.activePairKey = null;
  }

  next();
});

export const Request = mongoose.model('Request', requestSchema);
export default Request;
