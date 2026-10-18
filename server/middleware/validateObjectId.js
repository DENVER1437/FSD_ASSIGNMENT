import mongoose from 'mongoose';

/**
 * Middleware factory to validate MongoDB ObjectId route parameters.
 * @param {string} paramName - Parameter name in req.params (defaults to 'id')
 */
export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid ID format for parameter '${paramName}'`,
    });
  }
  next();
};

export default validateObjectId;
