import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCompatibility, scoreBudget } from '../services/matchingService.js';

test('Matching Algorithm - Identical Complete Preferences yield 100% score', () => {
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
  };

  const result = calculateCompatibility(
    pref,
    pref,
    { id: 'user_1', college: 'Nirma University' },
    { id: 'user_2', college: 'Nirma University' }
  );

  assert.equal(result.score, 100);
  assert.equal(result.compatibilityLevel, 'Exceptional Match');
  assert.equal(result.isPartial, false);
  assert.equal(result.evaluatedWeight, 100);
  assert.ok(result.categoryBreakdown.length === 8);
  assert.ok(result.commonPreferences.length > 0);
});

test('Matching Algorithm - Missing preferences handle gracefully without artificial inflation', () => {
  // Completely null preferences
  const result1 = calculateCompatibility(null, null);
  assert.equal(result1.score, 0);
  assert.equal(result1.compatibilityLevel, 'Insufficient Data');
  assert.equal(result1.evaluatedWeight, 0);
  assert.equal(result1.isPartial, true);

  // One profile has 1 question, the other has none
  const prefA = { sleepSchedule: 'night_owl' };
  const result2 = calculateCompatibility(prefA, null);
  assert.equal(result2.score, 0);
  assert.equal(result2.compatibilityLevel, 'Insufficient Data');
  assert.equal(result2.evaluatedWeight, 0);
});

test('Matching Algorithm - Incomplete questionnaires evaluate available overlapping factors and flag partial status', () => {
  // Both answered only sleep and cleanliness (20 + 15 = 35 weight)
  const prefA = {
    sleepSchedule: 'night_owl',
    cleanliness: 'meticulous',
  };
  const prefB = {
    sleepSchedule: 'night_owl',
    cleanliness: 'meticulous',
  };

  const result = calculateCompatibility(prefA, prefB);
  // Evaluated weight is 35 (< 50, so insufficient data overall)
  assert.equal(result.evaluatedWeight, 35);
  assert.equal(result.isPartial, true);
  assert.equal(result.compatibilityLevel, 'Insufficient Data');
  // But score on the factors they did answer is 100%
  assert.equal(result.score, 100);

  // Unanswered categories are marked as Not Specified
  const budgetCat = result.categoryBreakdown.find((c) => c.name === 'Budget Alignment');
  assert.ok(budgetCat);
  assert.equal(budgetCat.isEvaluated, false);
  assert.equal(budgetCat.status, 'Not Specified');
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
  assert.ok(result.score < 50, `Expected low score (<50), got ${result.score}`);
  assert.equal(result.compatibilityLevel, 'Low Compatibility');
  assert.ok(result.differences.length >= 3);
});

test('Matching Algorithm - Partial compatibility returns moderate score (70-90)', () => {
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
  assert.ok(['Strong Alignment', 'High Compatibility'].includes(result.compatibilityLevel));
});

test('Matching Algorithm - Budget distance penalties: overlapping vs non-overlapping', () => {
  // Test direct scoreBudget function
  assert.equal(scoreBudget('5000-8000', '5000-8000'), 1.0); // Distance 0: Exact match
  assert.equal(scoreBudget('5000-8000', '8000-12000'), 0.65); // Distance 1: Adjacent tier
  assert.equal(scoreBudget('under_5000', '8000-12000'), 0.25); // Distance 2: Separated by 1 tier
  assert.equal(scoreBudget('<5000', '12000+'), 0.0); // Distance 3: Maximum separation

  // In matching flow
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

  const scoreExact = calculateCompatibility({ ...base, budget: '5000-8000' }, { ...base, budget: '5000-8000' }).score;
  const scoreAdjacent = calculateCompatibility({ ...base, budget: '5000-8000' }, { ...base, budget: '8000-12000' }).score;
  const scoreGap = calculateCompatibility({ ...base, budget: '<5000' }, { ...base, budget: '8000-12000' }).score;
  const scoreExtreme = calculateCompatibility({ ...base, budget: '<5000' }, { ...base, budget: '12000+' }).score;

  assert.ok(scoreExact > scoreAdjacent);
  assert.ok(scoreAdjacent > scoreGap);
  assert.ok(scoreGap > scoreExtreme);
});

test('Matching Algorithm - Self-match exclusion returns zero compatibility', () => {
  const pref = { sleepSchedule: 'night_owl', budget: '5000-8000' };
  const user = { id: '67b3f1a2b3c4d5e6f7a8b9c0' };

  const result = calculateCompatibility(pref, pref, user, user);
  assert.equal(result.score, 0);
  assert.equal(result.compatibilityLevel, 'Self Match');
  assert.match(result.differences[0], /Cannot evaluate compatibility with yourself/);
});

test('Matching Algorithm - Score normalized strictly within [0, 100] without division-by-zero', () => {
  const emptyA = {};
  const emptyB = {};
  const result = calculateCompatibility(emptyA, emptyB);
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(!isNaN(result.score));

  // Invalid data values
  const invalidA = { budget: 'unknown_currency', cleanliness: 'super_dirty' };
  const invalidB = { budget: 'not_a_budget', cleanliness: 'unknown' };
  const resultInvalid = calculateCompatibility(invalidA, invalidB);
  assert.ok(resultInvalid.score >= 0 && resultInvalid.score <= 100);
  assert.ok(!isNaN(resultInvalid.score));
});

test('Matching Algorithm - Changing preferences dynamically changes score', () => {
  const prefStudent = {
    sleepSchedule: 'early_bird',
    budget: '<5000',
    cleanliness: 'meticulous',
    foodPreference: 'vegetarian',
  };

  const candidateA = {
    sleepSchedule: 'early_bird',
    budget: '<5000',
    cleanliness: 'meticulous',
    foodPreference: 'vegetarian',
  };

  const initialScore = calculateCompatibility(prefStudent, candidateA).score;

  // Student updates budget and sleep
  const updatedStudent = {
    ...prefStudent,
    sleepSchedule: 'night_owl',
    budget: '12000+',
  };

  const updatedScore = calculateCompatibility(updatedStudent, candidateA).score;
  assert.ok(initialScore > updatedScore, 'Score should drop when lifestyle preferences diverge');
});
