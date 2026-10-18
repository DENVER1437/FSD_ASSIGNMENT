/**
 * Async handler wrapper to forward rejected promises to Express error middleware.
 * @param {Function} fn - Async controller function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
