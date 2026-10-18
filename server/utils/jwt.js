import jwt from 'jsonwebtoken';

/**
 * Get JWT secret securely with production enforcement.
 */
const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production.');
    }
    return 'nestmatch_dev_jwt_secret_key_2026_fsd';
  }
  return secret;
};

/**
 * Generate a signed JSON Web Token
 * @param {string} userId - User ID to encode in token subject/payload
 * @param {string} role - User role ('student' | 'admin')
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId, role = 'student') => {
  const secret = getSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: userId,
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
  const secret = getSecret();
  return jwt.verify(token, secret);
};

