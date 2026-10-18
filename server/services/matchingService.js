/**
 * NestMatch Weighted Compatibility Scoring Engine
 * Implements the mathematical compatibility model specified in docs/development-roadmap.md:
 * 
 * - Sleep Schedule: 20%
 * - Budget Parity: 20%
 * - Cleanliness: 15%
 * - Food & Diet: 10%
 * - Noise Tolerance: 10%
 * - Study Habits: 10%
 * - Social Extroversion: 10%
 * - Other Factors (Smoking & Guests): 5%
 * Total: 100%
 */

// Helper: map budget strings to ordinal tiers
const BUDGET_TIERS = {
  '<5000': 1,
  under_5000: 1,
  '5000-8000': 2,
  '8000-12000': 3,
  '12000+': 4,
  above_12000: 4,
};

// Helper: map ordinal levels
const ORDINAL_3 = {
  // Cleanliness
  relaxed: 1,
  moderate: 2,
  moderately_clean: 2,
  clean: 2,
  meticulous: 3,
  // Noise
  silent: 1,
  low: 1,
  moderate: 2,
  lively: 3,
  tolerant: 3,
  high: 3,
  // Social
  introvert: 1,
  ambivert: 2,
  extrovert: 3,
  // Guest
  no_overnight_guests: 1,
  occasional_guests: 2,
  frequent_guests: 3,
  open_house: 3,
};


export const calculateCompatibility = (prefA, prefB, userA = {}, userB = {}) => {
  if (!prefA || !prefB || (Object.keys(prefA).length === 0 && Object.keys(prefB).length === 0)) {
    return {
      score: 50,
      compatibilityLevel: 'Insufficient Data',
      commonPreferences: [],
      differences: ['One or both students have not completed their lifestyle questionnaire.'],
      categoryBreakdown: [],
    };
  }

  // Normalize fields with robust defaults to handle incomplete surveys safely
  const pA = {
    sleepSchedule: prefA.sleepSchedule || 'flexible',
    wakeUpSchedule: prefA.wakeUpSchedule || '7am_9am',
    budget: prefA.budget || '5000-8000',
    cleanliness: prefA.cleanliness || 'moderate',
    foodPreference: prefA.foodPreference || 'any',
    noisePreference: prefA.noisePreference || prefA.noiseTolerance || 'moderate',
    studyHabit: prefA.studyHabit || 'in_room_quiet',
    socialLevel: prefA.socialLevel || prefA.socialHabit || 'ambivert',
    smokingPreference: prefA.smokingPreference || 'strictly_non_smoker',
    guestPreference: prefA.guestPreference || 'occasional_guests',
  };

  const pB = {
    sleepSchedule: prefB.sleepSchedule || 'flexible',
    wakeUpSchedule: prefB.wakeUpSchedule || '7am_9am',
    budget: prefB.budget || '5000-8000',
    cleanliness: prefB.cleanliness || 'moderate',
    foodPreference: prefB.foodPreference || 'any',
    noisePreference: prefB.noisePreference || prefB.noiseTolerance || 'moderate',
    studyHabit: prefB.studyHabit || 'in_room_quiet',
    socialLevel: prefB.socialLevel || prefB.socialHabit || 'ambivert',
    smokingPreference: prefB.smokingPreference || 'strictly_non_smoker',
    guestPreference: prefB.guestPreference || 'occasional_guests',
  };

  const commonPreferences = [];
  const differences = [];
  const categoryBreakdown = [];

  // 1. Sleep Schedule (Weight: 20%)
  let sleepFactor = 0.5;
  if (pA.sleepSchedule === pB.sleepSchedule) {
    sleepFactor = 1.0;
    commonPreferences.push(`Both share a ${pA.sleepSchedule.replace(/_/g, ' ')} sleep schedule`);
  } else if (pA.sleepSchedule === 'flexible' || pB.sleepSchedule === 'flexible') {
    sleepFactor = 0.75;
  } else {
    sleepFactor = 0.2;
    differences.push(
      `Sleep: One is ${pA.sleepSchedule.replace(/_/g, ' ')} while the other is ${pB.sleepSchedule.replace(/_/g, ' ')}`
    );
  }

  let wakeFactor = 0.5;
  if (pA.wakeUpSchedule === pB.wakeUpSchedule) {
    wakeFactor = 1.0;
  } else if (
    (pA.wakeUpSchedule === '7am_9am' && pB.wakeUpSchedule !== '7am_9am') ||
    (pB.wakeUpSchedule === '7am_9am' && pA.wakeUpSchedule !== '7am_9am')
  ) {
    wakeFactor = 0.6;
  } else {
    wakeFactor = 0.3;
  }
  const combinedSleep = 0.65 * sleepFactor + 0.35 * wakeFactor;
  categoryBreakdown.push({
    name: 'Sleep Schedule',
    score: Math.round(combinedSleep * 100),
    status: combinedSleep >= 0.85 ? 'Perfect' : combinedSleep >= 0.6 ? 'Good' : 'Moderate',
    note: sleepFactor === 1.0 ? 'Synchronized sleep & wake patterns' : 'Slightly divergent sleep hours',
  });

  // 2. Budget Parity (Weight: 20%)
  const tierA = BUDGET_TIERS[pA.budget] || 2;
  const tierB = BUDGET_TIERS[pB.budget] || 2;
  const budgetDiff = Math.abs(tierA - tierB);
  let budgetFactor = 1.0;
  if (budgetDiff === 0) {
    budgetFactor = 1.0;
    commonPreferences.push(`Identical rent budget tier (${pA.budget})`);
  } else if (budgetDiff === 1) {
    budgetFactor = 0.65;
    differences.push(`Budget: Adjacent rent targets (${pA.budget} vs ${pB.budget})`);
  } else if (budgetDiff === 2) {
    budgetFactor = 0.25;
    differences.push(`Budget: Notable disparity in rent budget (${pA.budget} vs ${pB.budget})`);
  } else {
    budgetFactor = 0.0;
    differences.push(`Budget: Substantial difference in target rent`);
  }
  categoryBreakdown.push({
    name: 'Budget Alignment',
    score: Math.round(budgetFactor * 100),
    status: budgetFactor >= 0.85 ? 'Perfect' : budgetFactor >= 0.6 ? 'Good' : 'Needs Discussion',
    note: budgetDiff === 0 ? 'Exact financial parity' : 'Requires mutual agreement on rent share',
  });

  // 3. Cleanliness Standard (Weight: 15%)
  const cleanA = ORDINAL_3[pA.cleanliness] || 2;
  const cleanB = ORDINAL_3[pB.cleanliness] || 2;
  const cleanDiff = Math.abs(cleanA - cleanB);
  let cleanFactor = 1.0;
  if (cleanDiff === 0) {
    cleanFactor = 1.0;
    commonPreferences.push(`Shared standard of ${pA.cleanliness} room cleanliness`);
  } else if (cleanDiff === 1) {
    cleanFactor = 0.65;
  } else {
    cleanFactor = 0.2;
    differences.push(`Cleanliness: ${pA.cleanliness} vs ${pB.cleanliness} chore expectations`);
  }
  categoryBreakdown.push({
    name: 'Cleanliness Standards',
    score: Math.round(cleanFactor * 100),
    status: cleanFactor >= 0.85 ? 'Perfect' : cleanFactor >= 0.6 ? 'Good' : 'Challenging',
    note: cleanDiff === 0 ? 'Harmonious chore sharing expectations' : 'May require a chore schedule',
  });

  // 4. Food & Dietary Habits (Weight: 10%)
  let foodFactor = 0.7;
  if (pA.foodPreference === 'any' || pB.foodPreference === 'any') {
    foodFactor = 1.0;
    commonPreferences.push('Flexible shared kitchen dietary environment');
  } else if (pA.foodPreference === pB.foodPreference) {
    foodFactor = 1.0;
    commonPreferences.push(`Both observe ${pA.foodPreference} dietary habits`);
  } else if (
    (pA.foodPreference === 'vegetarian' && pB.foodPreference === 'vegan') ||
    (pA.foodPreference === 'vegan' && pB.foodPreference === 'vegetarian')
  ) {
    foodFactor = 0.85;
    commonPreferences.push('Both maintain plant-friendly kitchens');
  } else {
    foodFactor = 0.45;
    differences.push(`Diet: ${pA.foodPreference} and ${pB.foodPreference} kitchen practices`);
  }
  categoryBreakdown.push({
    name: 'Diet & Cooking',
    score: Math.round(foodFactor * 100),
    status: foodFactor >= 0.85 ? 'Perfect' : foodFactor >= 0.6 ? 'Good' : 'Moderate',
    note: foodFactor >= 0.85 ? 'Aligned meal and cooking preferences' : 'Separate cookware may be preferred',
  });

  // 5. Noise Tolerance (Weight: 10%)
  const noiseA = ORDINAL_3[pA.noisePreference] || 2;
  const noiseB = ORDINAL_3[pB.noisePreference] || 2;
  const noiseDiff = Math.abs(noiseA - noiseB);
  let noiseFactor = 1.0;
  if (noiseDiff === 0) {
    noiseFactor = 1.0;
    commonPreferences.push(`Both prefer a ${pA.noisePreference} room atmosphere`);
  } else if (noiseDiff === 1) {
    noiseFactor = 0.65;
  } else {
    noiseFactor = 0.2;
    differences.push(`Noise: ${pA.noisePreference} preference vs ${pB.noisePreference}`);
  }
  categoryBreakdown.push({
    name: 'Noise & Atmosphere',
    score: Math.round(noiseFactor * 100),
    status: noiseFactor >= 0.85 ? 'Perfect' : noiseFactor >= 0.6 ? 'Good' : 'Needs Ground Rules',
    note: noiseDiff === 0 ? 'Aligned sound comfort levels' : 'Headphones recommended during quiet hours',
  });

  // 6. Study Habits (Weight: 10%)
  let studyFactor = 0.5;
  if (pA.studyHabit === pB.studyHabit) {
    studyFactor = 1.0;
    commonPreferences.push(`Both prefer ${pA.studyHabit.replace(/_/g, ' ')} study routine`);
  } else if (pA.studyHabit === 'library_study' || pB.studyHabit === 'library_study') {
    studyFactor = 0.8;
  } else {
    studyFactor = 0.35;
    differences.push(`Study Habits: ${pA.studyHabit.replace(/_/g, ' ')} vs ${pB.studyHabit.replace(/_/g, ' ')}`);
  }
  categoryBreakdown.push({
    name: 'Study Environment',
    score: Math.round(studyFactor * 100),
    status: studyFactor >= 0.8 ? 'High' : studyFactor >= 0.5 ? 'Good' : 'Divergent',
    note: studyFactor >= 0.8 ? 'Compatible study focus routines' : 'May study in different locations',
  });

  // 7. Social Extroversion (Weight: 10%)
  const socA = ORDINAL_3[pA.socialLevel] || 2;
  const socB = ORDINAL_3[pB.socialLevel] || 2;
  const socDiff = Math.abs(socA - socB);
  let socialFactor = 1.0;
  if (socDiff === 0) {
    socialFactor = 1.0;
    commonPreferences.push(`Both identify as ${pA.socialLevel}s`);
  } else if (socDiff === 1) {
    socialFactor = 0.75;
  } else {
    socialFactor = 0.35;
    differences.push(`Social: ${pA.socialLevel} vs ${pB.socialLevel} lifestyle energy`);
  }
  categoryBreakdown.push({
    name: 'Social Harmony',
    score: Math.round(socialFactor * 100),
    status: socialFactor >= 0.8 ? 'High' : 'Moderate',
    note: socDiff === 0 ? 'Aligned guest and social expectations' : 'Complementary social balance',
  });

  // 8. Other Factors (Smoking & Guests) (Weight: 5%)
  let otherFactor = 1.0;
  if (
    pA.smokingPreference === 'strictly_non_smoker' &&
    pB.smokingPreference === 'smoker_friendly'
  ) {
    otherFactor = 0.1;
    differences.push('Smoking: Non-smoker vs smoker conflict');
  } else if (pA.smokingPreference === pB.smokingPreference) {
    otherFactor = 1.0;
    if (pA.smokingPreference === 'strictly_non_smoker') {
      commonPreferences.push('Both insist on a 100% smoke-free home');
    }
  } else {
    otherFactor = 0.6;
  }

  // Same college bonus
  if (userA.college && userB.college && userA.college.toLowerCase() === userB.college.toLowerCase()) {
    commonPreferences.push(`Same university campus (${userA.college})`);
  }


  // Calculate Weighted Total
  const totalScoreRaw =
    combinedSleep * 20 +
    budgetFactor * 20 +
    cleanFactor * 15 +
    foodFactor * 10 +
    noiseFactor * 10 +
    studyFactor * 10 +
    socialFactor * 10 +
    otherFactor * 5;

  const score = Math.round(Math.min(100, Math.max(0, totalScoreRaw)));

  let compatibilityLevel = 'Moderate Match';
  if (score >= 90) compatibilityLevel = 'Exceptional Match';
  else if (score >= 80) compatibilityLevel = 'High Compatibility';
  else if (score >= 70) compatibilityLevel = 'Strong Alignment';
  else if (score < 50) compatibilityLevel = 'Low Compatibility';

  return {
    score,
    compatibilityLevel,
    commonPreferences: commonPreferences.length > 0 ? commonPreferences : ['General roommate compatibility'],
    differences: differences.length > 0 ? differences : ['No major conflicting habits detected'],
    categoryBreakdown,
  };
};

export default { calculateCompatibility };
