import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Request } from '../models/Request.js';

test('Request Model - Pre-validate hook rejects self-request', async () => {
  const userId = new mongoose.Types.ObjectId();
  const selfReq = new Request({
    senderId: userId,
    receiverId: userId,
    status: 'pending',
  });

  const err = await selfReq.validate().catch((e) => e);
  assert.ok(err);
  assert.match(err.errors?.receiverId?.message || err.message, /cannot send a roommate request to yourself/i);
});

test('Request Model - Computes deterministic activePairKey for pending and accepted requests', async () => {
  const userA = new mongoose.Types.ObjectId('67b3f1a2b3c4d5e6f7a8b9c1');
  const userB = new mongoose.Types.ObjectId('67b3f1a2b3c4d5e6f7a8b9c2');

  const reqForward = new Request({
    senderId: userA,
    receiverId: userB,
    status: 'pending',
  });
  await reqForward.validate();

  const reqReverse = new Request({
    senderId: userB,
    receiverId: userA,
    status: 'pending',
  });
  await reqReverse.validate();

  // Both directions must produce the identical activePairKey to enforce uniqueness across the unordered pair
  assert.ok(reqForward.activePairKey);
  assert.equal(reqForward.activePairKey, reqReverse.activePairKey);
  assert.equal(reqForward.activePairKey, '67b3f1a2b3c4d5e6f7a8b9c1:67b3f1a2b3c4d5e6f7a8b9c2');

  // When accepted, activePairKey remains set
  const reqAccepted = new Request({
    senderId: userA,
    receiverId: userB,
    status: 'accepted',
  });
  await reqAccepted.validate();
  assert.equal(reqAccepted.activePairKey, '67b3f1a2b3c4d5e6f7a8b9c1:67b3f1a2b3c4d5e6f7a8b9c2');
});

test('Request Model - Sets activePairKey to null when status is rejected to release uniqueness', async () => {
  const userA = new mongoose.Types.ObjectId('67b3f1a2b3c4d5e6f7a8b9c1');
  const userB = new mongoose.Types.ObjectId('67b3f1a2b3c4d5e6f7a8b9c2');

  const reqRejected = new Request({
    senderId: userA,
    receiverId: userB,
    status: 'rejected',
  });
  await reqRejected.validate();

  // Must be null so partial unique index ignores it
  assert.equal(reqRejected.activePairKey, null);
});

test('Request Model - Sets activePairKey to null when status is cancelled to release uniqueness', async () => {
  const userA = new mongoose.Types.ObjectId('67b3f1a2b3c4d5e6f7a8b9c1');
  const userB = new mongoose.Types.ObjectId('67b3f1a2b3c4d5e6f7a8b9c2');

  const reqCancelled = new Request({
    senderId: userA,
    receiverId: userB,
    status: 'cancelled',
  });
  await reqCancelled.validate();

  assert.equal(reqCancelled.activePairKey, null);
});
