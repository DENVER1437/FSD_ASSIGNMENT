import test from 'node:test';
import assert from 'node:assert/strict';
import { canRunDestructiveSeed } from '../scripts/seed.js';

test('Seed Safety Guard - Rejects execution in production', () => {
  const result = canRunDestructiveSeed({
    nodeEnv: 'production',
    confirmReset: 'true',
    cliArgs: ['--confirm'],
    mongoUri: 'mongodb://127.0.0.1:27017/nestmatch',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /CRITICAL SAFETY BLOCK.*production/);
});

test('Seed Safety Guard - Rejects execution without explicit confirmation', () => {
  const result = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: undefined,
    cliArgs: [],
    mongoUri: 'mongodb://127.0.0.1:27017/nestmatch',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /SAFETY GUARD.*requires explicit confirmation/);
});

test('Seed Safety Guard - Rejects execution against unapproved database targets', () => {
  const result = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: 'true',
    cliArgs: ['--confirm'],
    mongoUri: 'mongodb+srv://prod-admin:secret@live-production-cluster.mongodb.net/customer_data',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /SAFETY GUARD.*does not identify an approved local\/development\/test database/);
});

test('Seed Safety Guard - Permits execution with confirmation on local dev database', () => {
  const resultEnv = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: 'true',
    cliArgs: [],
    mongoUri: 'mongodb://127.0.0.1:27017/nestmatch',
  });
  assert.equal(resultEnv.allowed, true);

  const resultCli = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: undefined,
    cliArgs: ['--confirm'],
    mongoUri: 'mongodb://127.0.0.1:27017/nestmatch_test',
  });
  assert.equal(resultCli.allowed, true);
});
