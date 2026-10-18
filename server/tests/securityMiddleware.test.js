import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { requireDB } from '../middleware/requireDB.js';
import mongoose from 'mongoose';

test('Security Middleware - requireDB passes when DB is connected', () => {
  // Mock mongoose.connection.readyState = 1
  const originalState = mongoose.connection.readyState;
  Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

  let nextCalled = false;
  const req = {};
  const res = {
    status: () => res,
    json: () => res,
  };

  requireDB(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true, 'next() should be called when database is connected');
  Object.defineProperty(mongoose.connection, 'readyState', { value: originalState, configurable: true });
});

test('Security Middleware - requireDB returns 503 when DB is offline', () => {
  const originalState = mongoose.connection.readyState;
  Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

  let statusCode = null;
  let jsonResponse = null;

  const req = {};
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (payload) => {
      jsonResponse = payload;
      return res;
    },
  };

  let nextCalled = false;
  requireDB(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false, 'next() must NOT be called when DB is offline');
  assert.equal(statusCode, 503, 'Should return HTTP 503 Service Unavailable');
  assert.equal(jsonResponse?.status, 'error');
  assert.match(jsonResponse?.message, /Database service is currently unavailable/);

  Object.defineProperty(mongoose.connection, 'readyState', { value: originalState, configurable: true });
});

test('Security Middleware - Rate limiter permits requests within budget and blocks excess', () => {
  const limiter = createRateLimiter({
    windowMs: 1000,
    max: 2,
    message: 'Rate limit exceeded for test',
  });

  const ip = '192.168.1.100';
  const req = { ip };
  let statusCode = null;
  let jsonBody = null;
  let headers = {};

  const res = {
    setHeader: (k, v) => {
      headers[k] = v;
    },
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (body) => {
      jsonBody = body;
      return res;
    },
  };

  // Temporarily set NODE_ENV to non-test so limiter evaluates
  const origEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  try {
    let call1 = false;
    limiter(req, res, () => { call1 = true; });
    assert.equal(call1, true, 'Request 1 should pass');

    let call2 = false;
    limiter(req, res, () => { call2 = true; });
    assert.equal(call2, true, 'Request 2 should pass');

    let call3 = false;
    limiter(req, res, () => { call3 = true; });
    assert.equal(call3, false, 'Request 3 exceeds limit of 2');
    assert.equal(statusCode, 429, 'Excess request receives 429 Too Many Requests');
    assert.equal(jsonBody?.message, 'Rate limit exceeded for test');
    assert.ok(headers['Retry-After']);
  } finally {
    process.env.NODE_ENV = origEnv;
  }
});
