import jwt from 'jsonwebtoken';

/**
 * Generate a signed JSON Web Token
 * @param {string} userId - User ID to encode in token subject/payload
 * @param {string} role - User role ('student' | 'admin')
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId, role = 'student') => {
  const secret = process.env.JWT_SECRET || 'nestmatch_dev_jwt_secret_key_2026_fsd';
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
  const secret = process.env.JWT_SECRET || 'nestmatch_dev_jwt_secret_key_2026_fsd';
  return jwt.verify(token, secret);
};
