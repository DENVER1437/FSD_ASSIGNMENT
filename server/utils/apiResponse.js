/**
 * Standardized API Response Utilities
 * Conforms to docs/api-plan.md contract
 */

export const sendSuccess = (res, data = {}, message = '', statusCode = 200) => {
  const response = {
    status: 'success',
    success: true,
  };
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json(response);
};

export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = []) => {
  const response = {
    status: 'error',
    success: false,
    message,
  };
  if (errors && errors.length > 0) response.errors = errors;
  return res.status(statusCode).json(response);
};

