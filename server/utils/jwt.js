import jwt from 'jsonwebtoken';

/**
 * Get JWT secret securely.
 * Must be explicitly configured via process.env.JWT_SECRET.
 * Fails safely if missing in any environment. Never silently uses a fallback secret.
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error('JWT configuration error: JWT_SECRET environment variable is missing or empty. Please set JWT_SECRET in your .env file.');
  }
  return secret.trim();
};

/**
 * Validate JWT configuration during startup or tests.
 */
export const validateJwtConfig = () => {
  try {
    getJwtSecret();
    return true;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[FATAL CONFIG ERROR]:', err.message);
      process.exit(1);
    }
    throw err;
  }
};

/**
 * Generate a signed JSON Web Token
 * @param {string} userId - User ID to encode in token subject/payload
 * @param {string} role - User role ('student' | 'admin')
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId, role = 'student') => {
  if (!userId) {
    throw new Error('Cannot sign JWT: userId is required');
  }

  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: userId.toString(),
      role,
    },
    secret,
    {
      expiresIn,
    }
  );
};

/**
 * Verify a JSON Web Token
 * @param {string} token - Bearer JWT string
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('JWT verification error: No token provided or token is malformed.');
  }

  const secret = getJwtSecret();
  return jwt.verify(token, secret);
};

