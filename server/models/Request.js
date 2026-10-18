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
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [300, 'Message cannot exceed 300 characters'],
      default: 'Hey! Saw our compatibility score on NestMatch. Would love to connect!',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find requests between pairs
requestSchema.index({ senderId: 1, receiverId: 1 });

// Prevent self-request
requestSchema.pre('validate', function (next) {
  if (this.senderId && this.receiverId && this.senderId.toString() === this.receiverId.toString()) {
    this.invalidate('receiverId', 'You cannot send a roommate request to yourself');
  }
  next();
});

export const Request = mongoose.model('Request', requestSchema);
export default Request;
