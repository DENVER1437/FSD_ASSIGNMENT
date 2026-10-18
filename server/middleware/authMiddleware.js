import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

/**
 * Protect routes: verify JWT Bearer token and attach active user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      status: 'error',
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        status: 'error',
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      status: 'error',
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }
};

/**
 * Authorize role-based access
 * @param  {...string} roles - Permitted roles (e.g. 'admin', 'student')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        status: 'error',
        message: `Forbidden: role '${req.user?.role || 'guest'}' does not have permission to access this resource.`,
      });
    }
    next();
  };
};

export default { protect, authorize };
