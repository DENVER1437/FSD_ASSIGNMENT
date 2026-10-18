/**
 * Lightweight in-memory sliding window rate limiter.
 * Protects authentication and messaging routes against abusive burst loads.
 */

export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests from this IP, please try again later.',
} = {}) => {
  const requests = new Map();

  // Periodic memory cleanup every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requests.entries()) {
      if (now - data.startTime > windowMs) {
        requests.delete(ip);
      }
    }
  }, Math.min(windowMs, 5 * 60 * 1000));

  // Ensure interval does not prevent process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // In test environment, bypass rate limits to avoid flakiness in fast test suites
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown-client';
    const now = Date.now();

    const record = requests.get(ip);

    if (!record || now - record.startTime > windowMs) {
      requests.set(ip, {
        count: 1,
        startTime: now,
      });
      return next();
    }

    record.count++;

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.startTime + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        status: 'error',
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };
};

// Specialized rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,                  // 50 attempts per 15 mins
  message: 'Too many authentication attempts from this IP address. Please try again in 15 minutes.',
});

export const messageRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  max: 60,                  // 60 messages per minute
  message: 'Message dispatch rate limit reached. Please wait a moment before sending more messages.',
});

export default createRateLimiter;
