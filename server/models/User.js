import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide student name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide university email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    college: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    course: {
      type: String,
      trim: true,
      default: '',
    },
    age: {
      type: Number,
      min: [16, 'Age must be at least 16'],
      max: [99, 'Age must be at most 99'],
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    settings: {
      emailNotifications: { type: Boolean, default: true },
      matchAlerts: { type: Boolean, default: true },
      requestAlerts: { type: Boolean, default: true },
      chatNotifications: { type: Boolean, default: true },
      hideBudgetFromPublic: { type: Boolean, default: false },
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Safe JSON representation without sensitive fields
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    college: this.college,
    city: this.city,
    course: this.course,
    age: this.age,
    bio: this.bio,
    profileImage: this.profileImage,
    role: this.role,
    status: this.status,
    settings: this.settings || {
      emailNotifications: true,
      matchAlerts: true,
      requestAlerts: true,
      chatNotifications: true,
      hideBudgetFromPublic: false,
    },
    isProfileComplete: this.isProfileComplete,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model('User', userSchema);
export default User;
