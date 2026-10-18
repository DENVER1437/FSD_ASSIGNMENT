import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @desc    Register a new student account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, college, city, course } = req.body;

  if (!name || !email || !password) {
    return sendError(res, 'Please provide name, email, and password', 400);
  }

  if (password.length < 6) {
    return sendError(res, 'Password must be at least 6 characters', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return sendError(res, 'An account with this email already exists', 409);
  }

  // Create student user with enforced student role
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    college: college ? college.trim() : '',
    city: city ? city.trim() : '',
    course: course ? course.trim() : '',
    role: 'student', // Enforce default role to prevent privilege escalation
    status: 'active',
  });

  const token = generateToken(user._id, user.role);

  return sendSuccess(
    res,
    {
      token,
      user: user.toSafeObject(),
    },
    'Account registered successfully',
    201
  );
});

/**
 * @desc    Authenticate user and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Please provide email and password', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Explicitly select password field which is otherwise excluded
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid email or password', 401);
  }

  if (user.status === 'suspended') {
    return sendError(res, 'Your account has been suspended. Please contact support.', 403);
  }

  const token = generateToken(user._id, user.role);

  return sendSuccess(
    res,
    {
      token,
      user: user.toSafeObject(),
    },
    'Login successful',
    200
  );
});

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private (JWT)
 */
export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, { user: req.user.toSafeObject() }, 'User profile retrieved');
});

/**
 * @desc    Logout current user
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, null, 'Logged out successfully');
});

