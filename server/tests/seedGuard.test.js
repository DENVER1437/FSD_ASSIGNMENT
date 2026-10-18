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
  // Uses synthetic non-credentialed RFC 2606 domain fixture to test guard without triggering secret scanners
  const result = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: 'true',
    cliArgs: ['--confirm'],
    mongoUri: 'mongodb://unapproved-remote.example.internal:27017/remote_data',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /SAFETY GUARD.*does not identify an approved local\/development\/test database/);
});

test('Seed Safety Guard - Rejects execution against remote Atlas cloud clusters', () => {
  // Ensures cloud database clusters are protected from destructive collection drops even if named nestmatch
  const result = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: 'true',
    cliArgs: ['--confirm'],
    mongoUri: 'mongodb+srv://unapproved-cluster.example.net/nestmatch',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /SAFETY GUARD.*does not identify an approved local\/development\/test database/);
});

test('Seed Safety Guard - Rejects execution when database name is unapproved', () => {
  const result = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: 'true',
    cliArgs: ['--confirm'],
    mongoUri: 'mongodb://127.0.0.1:27017/unapproved_database',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /SAFETY GUARD.*does not identify an approved local\/development\/test database/);
});

test('Seed Safety Guard - Rejects execution when target connection string is empty', () => {
  const result = canRunDestructiveSeed({
    nodeEnv: 'development',
    confirmReset: 'true',
    cliArgs: ['--confirm'],
    mongoUri: '',
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /SAFETY GUARD.*empty or unidentified/);
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
