import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCompatibility } from '../services/matchingService.js';

test('Matching Algorithm - Identical Preferences yield 100% score', () => {
  const pref = {
    sleepSchedule: 'night_owl',
    wakeUpSchedule: 'after_9am',
    budget: '5000-8000',
    cleanliness: 'meticulous',
    foodPreference: 'vegetarian',
    noisePreference: 'silent',
    studyHabit: 'in_room_quiet',
    socialLevel: 'ambivert',
    smokingPreference: 'strictly_non_smoker',
    guestPreference: 'occasional_guests',
  };

  const result = calculateCompatibility(pref, pref, { college: 'Apex Tech' }, { college: 'Apex Tech' });
  assert.equal(result.score, 100);
  assert.equal(result.compatibilityLevel, 'Exceptional Match');
  assert.ok(result.categoryBreakdown.length > 0);
  assert.ok(result.commonPreferences.length > 0);
});

test('Matching Algorithm - Missing preferences handle gracefully without crashing or inflated score', () => {
  const result1 = calculateCompatibility(null, null);
  assert.equal(result1.score, 50);
  assert.equal(result1.compatibilityLevel, 'Insufficient Data');

  const prefA = { sleepSchedule: 'night_owl' };
  const result2 = calculateCompatibility(prefA, null);
  assert.equal(result2.score, 50);
  assert.equal(result2.compatibilityLevel, 'Insufficient Data');
});

test('Matching Algorithm - Strongly conflicting preferences produce low score', () => {
  const prefA = {
    sleepSchedule: 'early_bird',
    wakeUpSchedule: 'before_7am',
    budget: '<5000',
    cleanliness: 'meticulous',
    foodPreference: 'vegetarian',
    noisePreference: 'silent',
    studyHabit: 'in_room_quiet',
    socialLevel: 'introvert',
    smokingPreference: 'strictly_non_smoker',
  };

  const prefB = {
    sleepSchedule: 'night_owl',
    wakeUpSchedule: 'after_9am',
    budget: '12000+',
    cleanliness: 'relaxed',
    foodPreference: 'non_vegetarian',
    noisePreference: 'tolerant',
    studyHabit: 'in_room_music',
    socialLevel: 'extrovert',
    smokingPreference: 'smoker_friendly',
  };

  const result = calculateCompatibility(prefA, prefB);
  assert.ok(result.score < 50, `Expected low score, got ${result.score}`);
  assert.equal(result.compatibilityLevel, 'Low Compatibility');
  assert.ok(result.differences.length >= 3);
});

test('Matching Algorithm - Partial compatibility returns moderate or high score', () => {
  const prefA = {
    sleepSchedule: 'night_owl',
    wakeUpSchedule: '7am_9am',
    budget: '5000-8000',
    cleanliness: 'moderate',
    foodPreference: 'vegetarian',
    noisePreference: 'moderate',
    studyHabit: 'library_study',
    socialLevel: 'ambivert',
    smokingPreference: 'strictly_non_smoker',
  };

  const prefB = {
    sleepSchedule: 'flexible',
    wakeUpSchedule: '7am_9am',
    budget: '5000-8000',
    cleanliness: 'meticulous',
    foodPreference: 'vegan',
    noisePreference: 'moderate',
    studyHabit: 'in_room_quiet',
    socialLevel: 'introvert',
    smokingPreference: 'strictly_non_smoker',
  };

  const result = calculateCompatibility(prefA, prefB);
  assert.ok(result.score >= 70 && result.score <= 90, `Expected 70-90, got ${result.score}`);
});

test('Matching Algorithm - Budget distance penalties', () => {
  const base = {
    sleepSchedule: 'flexible',
    wakeUpSchedule: '7am_9am',
    cleanliness: 'moderate',
    foodPreference: 'any',
    noisePreference: 'moderate',
    studyHabit: 'library_study',
    socialLevel: 'ambivert',
    smokingPreference: 'strictly_non_smoker',
  };

  // Same tier (0 diff)
  const scoreSame = calculateCompatibility(
    { ...base, budget: '5000-8000' },
    { ...base, budget: '5000-8000' }
  ).score;

  // Adjacent tier (1 diff)
  const scoreAdjacent = calculateCompatibility(
    { ...base, budget: '5000-8000' },
    { ...base, budget: '8000-12000' }
  ).score;

  // Distant tier (2 diff)
  const scoreFar = calculateCompatibility(
    { ...base, budget: 'under_5000' },
    { ...base, budget: '8000-12000' }
  ).score;

  // Extreme tier (3 diff)
  const scoreOpposite = calculateCompatibility(
    { ...base, budget: '<5000' },
    { ...base, budget: '12000+' }
  ).score;

  assert.ok(scoreSame > scoreAdjacent, 'Same tier should score higher than adjacent tier');
  assert.ok(scoreAdjacent > scoreFar, 'Adjacent tier should score higher than 2-step gap');
  assert.ok(scoreFar > scoreOpposite, '2-step gap should score higher than maximum disparity');
});

test('Matching Algorithm - Score normalized strictly within [0, 100]', () => {
  const emptyA = {};
  const emptyB = {};
  const result = calculateCompatibility(emptyA, emptyB);
  assert.ok(result.score >= 0 && result.score <= 100);
});
