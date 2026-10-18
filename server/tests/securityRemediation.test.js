import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { canRunDestructiveSeed } from '../scripts/seed.js';
import { sanitizeMongoUri, validateDbConfig } from '../config/db.js';
import { validateJwtConfig } from '../utils/jwt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

test('Security Remediation - seedGuard.test.js does not contain hard-coded credentials or Atlas URIs', () => {
  const seedGuardPath = path.join(__dirname, 'seedGuard.test.js');
  const content = fs.readFileSync(seedGuardPath, 'utf8');

  // Verify no URI matching mongodb(+srv)://user:password@...
  const credentialUriRegex = /mongodb(?:\+srv)?:\/\/[^\s/:?#]+:[^\s/:?#]+@/i;
  assert.equal(
    credentialUriRegex.test(content),
    false,
    'seedGuard.test.js must not contain credentialed MongoDB connection strings.'
  );

  // Verify specific leaked pattern from alert is completely removed
  assert.equal(
    content.includes('live-production-cluster.mongodb.net'),
    false,
    'Target cluster from security alert must be completely removed from seedGuard.test.js'
  );
  assert.equal(
    content.includes('prod-admin:'),
    false,
    'Leaked credential fixture must not exist in seedGuard.test.js'
  );
});

test('Security Remediation - canRunDestructiveSeed rejects production environment targets', () => {
  const result = canRunDestructiveSeed({
    nodeEnv: 'production',
    confirmReset: 'true',
    cliArgs: ['--confirm'],
    mongoUri: 'mongodb://127.0.0.1:27017/nestmatch',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /CRITICAL SAFETY BLOCK.*production/i);
});

test('Security Remediation - canRunDestructiveSeed requires deliberate confirmation', () => {
  const result = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: undefined,
    cliArgs: ['--reset'],
    mongoUri: 'mongodb://127.0.0.1:27017/nestmatch',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /SAFETY GUARD.*requires explicit confirmation/i);
});

test('Security Remediation - canRunDestructiveSeed blocks remote Atlas cloud clusters', () => {
  const result = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: 'true',
    cliArgs: ['--confirm'],
    mongoUri: 'mongodb+srv://cluster0.example.net/nestmatch',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /SAFETY GUARD.*does not identify an approved local\/development\/test database/i);
});

test('Security Remediation - canRunDestructiveSeed validates target database name', () => {
  const result = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: 'true',
    cliArgs: ['--confirm'],
    mongoUri: 'mongodb://127.0.0.1:27017/unapproved_prod_clone',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /SAFETY GUARD.*does not identify an approved local\/development\/test database/i);
});

test('Security Remediation - sanitizeMongoUri redacts credentials safely', () => {
  const syntheticUri = 'mongodb+srv://test_user:secret_pass123@cluster0.example.net/nestmatch?retryWrites=true';
  const sanitized = sanitizeMongoUri(syntheticUri);

  assert.equal(sanitized.includes('secret_pass123'), false, 'Password must be completely redacted');
  assert.equal(sanitized.includes('test_user'), false, 'Username must be redacted');
  assert.equal(sanitized, 'mongodb+srv://***:***@cluster0.example.net/nestmatch?retryWrites=true');
});

test('Security Remediation - validateDbConfig fails safely in production when MONGODB_URI is missing', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalMongoUri = process.env.MONGODB_URI;
  const originalMongo = process.env.MONGO_URI;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.MONGODB_URI;
    delete process.env.MONGO_URI;

    assert.throws(
      () => validateDbConfig(),
      /Database configuration error: MONGODB_URI environment variable is required in production/
    );
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalMongoUri) process.env.MONGODB_URI = originalMongoUri;
    if (originalMongo) process.env.MONGO_URI = originalMongo;
  }
});

test('Security Remediation - validateJwtConfig fails safely when JWT_SECRET is missing', () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalEnv = process.env.NODE_ENV;

  try {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;

    assert.throws(
      () => validateJwtConfig(),
      /JWT configuration error: JWT_SECRET environment variable is missing or empty/
    );
  } finally {
    process.env.JWT_SECRET = originalSecret;
    process.env.NODE_ENV = originalEnv;
  }
});

test('Security Remediation - Environment example templates contain only placeholders', () => {
  const serverExamplePath = path.join(rootDir, 'server', '.env.example');
  const clientExamplePath = path.join(rootDir, 'client', '.env.example');

  const serverExample = fs.readFileSync(serverExamplePath, 'utf8');
  const clientExample = fs.readFileSync(clientExamplePath, 'utf8');

  // Verify server example uses placeholders and has no passwords
  assert.match(serverExample, /MONGODB_URI=replace_with_/);
  assert.match(serverExample, /JWT_SECRET=replace_with_/);
  assert.equal(/password123/i.test(serverExample), false);

  // Verify client example contains only public URL and no secrets
  assert.match(clientExample, /VITE_API_URL=/);
  assert.equal(clientExample.includes('JWT_SECRET'), false);
  assert.equal(clientExample.includes('MONGODB_URI'), false);
});
