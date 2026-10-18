import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, getJwtSecret, validateJwtConfig } from '../utils/jwt.js';

test('JWT Security - Missing or empty secret throws an explicit error', () => {
  const originalSecret = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assert.throws(
      () => getJwtSecret(),
      /JWT configuration error: JWT_SECRET environment variable is missing or empty/
    );

    assert.throws(
      () => generateToken('user123'),
      /JWT configuration error/
    );

    assert.throws(
      () => verifyToken('some.fake.token'),
      /JWT configuration error/
    );
  } finally {
    process.env.JWT_SECRET = originalSecret;
  }
});

test('JWT Security - Signs and verifies a valid token successfully', () => {
  const userId = '67b3f1a2b3c4d5e6f7a8b9c0';
  const role = 'student';

  const token = generateToken(userId, role);
  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = verifyToken(token);
  assert.equal(decoded.id, userId);
  assert.equal(decoded.role, role);
  assert.ok(decoded.exp);
  assert.ok(decoded.iat);
});

test('JWT Security - Rejects token with invalid signature', () => {
  const userId = '67b3f1a2b3c4d5e6f7a8b9c0';
  // Sign with an illegitimate secret
  const forgedToken = jwt.sign({ id: userId, role: 'admin' }, 'fraudulent_secret_key_9999');

  assert.throws(
    () => verifyToken(forgedToken),
    /invalid signature/
  );
});

test('JWT Security - Rejects expired token', () => {
  const userId = '67b3f1a2b3c4d5e6f7a8b9c0';
  const secret = getJwtSecret();
  // Sign an already expired token (1 second in the past)
  const expiredToken = jwt.sign({ id: userId, role: 'student' }, secret, { expiresIn: -1 });

  assert.throws(
    () => verifyToken(expiredToken),
    /jwt expired/
  );
});

test('JWT Security - Rejects malformed token', () => {
  assert.throws(
    () => verifyToken('not.a.valid.jwt'),
    /jwt malformed|invalid token/
  );

  assert.throws(
    () => verifyToken(''),
    /No token provided or token is malformed/
  );

  assert.throws(
    () => verifyToken(null),
    /No token provided or token is malformed/
  );
});

test('JWT Security - Startup validation succeeds when JWT_SECRET is set', () => {
  assert.equal(validateJwtConfig(), true);
});
