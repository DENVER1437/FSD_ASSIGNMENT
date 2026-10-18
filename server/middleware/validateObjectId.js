import mongoose from 'mongoose';

/**
 * Middleware factory to validate MongoDB ObjectId route parameters.
 * @param {string} paramName - Parameter name in req.params (defaults to 'id')
 */
export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  let id = req.params[paramName];
  if (id && typeof id === 'string' && id.startsWith('match-')) {
    id = id.slice(6);
  }
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      success: false,
      message: `Invalid ID format for parameter '${paramName}'`,
    });
  }
  next();
};

export default validateObjectId;
