/**
 * NestMatch Weighted Compatibility Scoring Engine
 * Implements the mathematical compatibility model specified in docs/development-roadmap.md
 * with rigorous handling of incomplete profiles and non-overlapping budgets.
 * 
 * Strict Weight Distribution (Total: 100%):
 * - Sleep Schedule: 20%
 * - Budget Parity: 20%
 * - Cleanliness: 15%
 * - Food & Diet: 10%
 * - Noise Tolerance: 10%
 * - Study Habits: 10%
 * - Social Habits: 10%
 * - Other Factors (Smoking & Domestic Policy): 5%
 */

// Helper: Map budget strings to ordinal tiers
export const BUDGET_TIERS = {
  '<5000': 1,
  under_5000: 1,
  '5000-8000': 2,
  '8000-12000': 3,
  '12000+': 4,
  above_12000: 4,
};

// Helper: Format budget strings with Rupee symbol
export const formatBudgetDisplay = (b) => {
  if (b === '<5000' || b === 'under_5000') return 'Under ₹5,000';
  if (b === '5000-8000') return '₹5,000–₹8,000';
  if (b === '8000-12000') return '₹8,000–₹12,000';
  if (b === '12000+' || b === 'above_12000') return '₹12,000+';
  return b;
};

// Helper: Map ordinal levels for 3-tier scales
export const ORDINAL_3 = {
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
  tolerant: 3,
  high: 3,
  lively: 3,
  // Social
  introvert: 1,
  ambivert: 2,
  extrovert: 3,
  // Guests
  no_overnight_guests: 1,
  occasional_guests: 2,
  frequent_guests: 3,
  open_house: 3,
};

/**
 * Compare budget preferences with explicit overlap / distance modeling.
 * Tier 1: <5000
 * Tier 2: 5000-8000
 * Tier 3: 8000-12000
 * Tier 4: 12000+
 *
 * Distance 0 (Exact tier match): 1.0 (100% match)
 * Distance 1 (Adjacent tier - partial flexibility): 0.65 (65% match)
 * Distance 2 (Separated by 1 tier - non-overlapping): 0.25 (25% match)
 * Distance 3 (Maximum separation - non-overlapping): 0.0 (0% match)
 */
export const scoreBudget = (budgetA, budgetB) => {
  const tierA = BUDGET_TIERS[budgetA];
  const tierB = BUDGET_TIERS[budgetB];

  if (!tierA || !tierB) return null;

  const diff = Math.abs(tierA - tierB);
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.65;
  if (diff === 2) return 0.25;
  return 0.0;
};

/**
 * Authoritative compatibility calculation function.
 * Distinguishes declared answers from missing fields without silently inventing preferences.
 * 
 * @param {object} prefA - Current user's questionnaire document
 * @param {object} prefB - Candidate student's questionnaire document
 * @param {object} userA - Current user profile metadata
 * @param {object} userB - Candidate student profile metadata
 * @returns {object} Explainable compatibility report
 */
export const calculateCompatibility = (prefA, prefB, userA = {}, userB = {}) => {
  // Prevent self-matching
  const idA = userA._id?.toString() || userA.id?.toString();
  const idB = userB._id?.toString() || userB.id?.toString();
  if (idA && idB && idA === idB) {
    return {
      score: 0,
      compatibilityLevel: 'Self Match',
      isPartial: false,
      evaluatedWeight: 0,
      completenessRatio: 0,
      commonPreferences: [],
      differences: ['Cannot evaluate compatibility with yourself.'],
      categoryBreakdown: [],
    };
  }

  // Handle completely missing preference documents
  if (!prefA || !prefB || (Object.keys(prefA).length === 0 && Object.keys(prefB).length === 0)) {
    return {
      score: 0,
      compatibilityLevel: 'Insufficient Data',
      isPartial: true,
      evaluatedWeight: 0,
      completenessRatio: 0,
      commonPreferences: [],
      differences: ['One or both students have not completed their lifestyle questionnaire.'],
      categoryBreakdown: [],
    };
  }

  const commonPreferences = [];
  const differences = [];
  const categoryBreakdown = [];

  let applicableWeight = 0;
  let weightedPoints = 0;

  // 1. Sleep Schedule (Weight: 20%)
  const sleepA = prefA.sleepSchedule;
  const sleepB = prefB.sleepSchedule;
  const wakeA = prefA.wakeUpSchedule;
  const wakeB = prefB.wakeUpSchedule;

  if (sleepA && sleepB) {
    let sleepFactor = 0.5;
    if (sleepA === sleepB) {
      sleepFactor = 1.0;
      commonPreferences.push(`Both share a ${sleepA.replace(/_/g, ' ')} sleep routine`);
    } else if (sleepA === 'flexible' || sleepB === 'flexible') {
      sleepFactor = 0.75;
    } else {
      sleepFactor = 0.2;
      differences.push(`Sleep: ${sleepA.replace(/_/g, ' ')} vs ${sleepB.replace(/_/g, ' ')}`);
    }

    let combinedSleep = sleepFactor;
    if (wakeA && wakeB) {
      let wakeFactor = 0.5;
      if (wakeA === wakeB) {
        wakeFactor = 1.0;
      } else if (
        (wakeA === '7am_9am' && wakeB !== '7am_9am') ||
        (wakeB === '7am_9am' && wakeA !== '7am_9am')
      ) {
        wakeFactor = 0.6;
      } else {
        wakeFactor = 0.3;
      }
      combinedSleep = 0.65 * sleepFactor + 0.35 * wakeFactor;
    }

    const catScore = Math.round(combinedSleep * 100);
    applicableWeight += 20;
    weightedPoints += combinedSleep * 20;

    categoryBreakdown.push({
      name: 'Sleep Schedule',
      score: catScore,
      factorScore: combinedSleep,
      weight: 20,
      status: catScore >= 85 ? 'Harmonious' : catScore >= 60 ? 'Good' : 'Divergent',
      note: sleepFactor === 1.0 ? 'Synchronized sleep & wake patterns' : 'Different bedtimes / wake hours',
      isEvaluated: true,
    });
  } else {
    categoryBreakdown.push({
      name: 'Sleep Schedule',
      score: null,
      factorScore: null,
      weight: 20,
      status: 'Not Specified',
      note: 'Sleep schedule not declared by one or both students',
      isEvaluated: false,
    });
  }

  // 2. Budget Parity (Weight: 20%)
  const budgetA = prefA.budget;
  const budgetB = prefB.budget;

  if (budgetA && budgetB) {
    const budgetFactor = scoreBudget(budgetA, budgetB);
    if (budgetFactor !== null) {
      const catScore = Math.round(budgetFactor * 100);
      applicableWeight += 20;
      weightedPoints += budgetFactor * 20;

      if (budgetFactor === 1.0) {
        commonPreferences.push(`Identical rent budget tier (${formatBudgetDisplay(budgetA)})`);
      } else if (budgetFactor === 0.65) {
        differences.push(`Budget: Adjacent rent targets (${formatBudgetDisplay(budgetA)} vs ${formatBudgetDisplay(budgetB)})`);
      } else if (budgetFactor === 0.25) {
        differences.push(`Budget: Non-overlapping rent targets (${formatBudgetDisplay(budgetA)} vs ${formatBudgetDisplay(budgetB)})`);
      } else {
        differences.push(`Budget: Extreme rent disparity (${formatBudgetDisplay(budgetA)} vs ${formatBudgetDisplay(budgetB)})`);
      }

      categoryBreakdown.push({
        name: 'Budget Alignment',
        score: catScore,
        factorScore: budgetFactor,
        weight: 20,
        status: catScore >= 85 ? 'Aligned' : catScore >= 60 ? 'Negotiable' : 'Disparate',
        note: budgetFactor === 1.0 ? 'Exact financial parity' : 'Rent share discussion needed',
        isEvaluated: true,
      });
    }
  } else {
    categoryBreakdown.push({
      name: 'Budget Alignment',
      score: null,
      factorScore: null,
      weight: 20,
      status: 'Not Specified',
      note: 'Rent budget range missing in questionnaire',
      isEvaluated: false,
    });
  }

  // 3. Cleanliness Standard (Weight: 15%)
  const cleanAVal = prefA.cleanliness;
  const cleanBVal = prefB.cleanliness;

  if (cleanAVal && cleanBVal && ORDINAL_3[cleanAVal] && ORDINAL_3[cleanBVal]) {
    const cleanDiff = Math.abs(ORDINAL_3[cleanAVal] - ORDINAL_3[cleanBVal]);
    let cleanFactor = 1.0;
    if (cleanDiff === 0) {
      cleanFactor = 1.0;
      commonPreferences.push(`Shared standard of ${cleanAVal} room cleanliness`);
    } else if (cleanDiff === 1) {
      cleanFactor = 0.65;
    } else {
      cleanFactor = 0.2;
      differences.push(`Cleanliness: ${cleanAVal} vs ${cleanBVal} expectations`);
    }

    const catScore = Math.round(cleanFactor * 100);
    applicableWeight += 15;
    weightedPoints += cleanFactor * 15;

    categoryBreakdown.push({
      name: 'Cleanliness Standards',
      score: catScore,
      factorScore: cleanFactor,
      weight: 15,
      status: catScore >= 85 ? 'Harmonious' : catScore >= 60 ? 'Acceptable' : 'Challenging',
      note: cleanDiff === 0 ? 'Harmonious chore sharing standards' : 'Chore schedule recommended',
      isEvaluated: true,
    });
  } else {
    categoryBreakdown.push({
      name: 'Cleanliness Standards',
      score: null,
      factorScore: null,
      weight: 15,
      status: 'Not Specified',
      note: 'Cleanliness standard not declared',
      isEvaluated: false,
    });
  }

  // 4. Food & Dietary Habits (Weight: 10%)
  const foodA = prefA.foodPreference;
  const foodB = prefB.foodPreference;

  if (foodA && foodB) {
    let foodFactor = 0.5;
    if (foodA === 'any' || foodB === 'any') {
      foodFactor = 1.0;
      commonPreferences.push('Flexible shared kitchen dietary environment');
    } else if (foodA === foodB) {
      foodFactor = 1.0;
      commonPreferences.push(`Both observe ${foodA} dietary habits`);
    } else if (
      (foodA === 'vegetarian' && foodB === 'vegan') ||
      (foodA === 'vegan' && foodB === 'vegetarian')
    ) {
      foodFactor = 0.85;
      commonPreferences.push('Both maintain plant-friendly kitchens');
    } else if (
      (foodA === 'vegetarian' && foodB === 'eggetarian') ||
      (foodA === 'eggetarian' && foodB === 'vegetarian')
    ) {
      foodFactor = 0.85;
    } else {
      foodFactor = 0.35;
      differences.push(`Diet: ${foodA} vs ${foodB} kitchen practices`);
    }

    const catScore = Math.round(foodFactor * 100);
    applicableWeight += 10;
    weightedPoints += foodFactor * 10;

    categoryBreakdown.push({
      name: 'Diet & Cooking',
      score: catScore,
      factorScore: foodFactor,
      weight: 10,
      status: catScore >= 85 ? 'Compatible' : catScore >= 60 ? 'Good' : 'Divergent',
      note: foodFactor >= 0.85 ? 'Aligned meal and cooking preferences' : 'Separate cookware may be preferred',
      isEvaluated: true,
    });
  } else {
    categoryBreakdown.push({
      name: 'Diet & Cooking',
      score: null,
      factorScore: null,
      weight: 10,
      status: 'Not Specified',
      note: 'Dietary habits not declared',
      isEvaluated: false,
    });
  }

  // 5. Noise Tolerance (Weight: 10%)
  const noiseA = prefA.noisePreference || prefA.noiseTolerance;
  const noiseB = prefB.noisePreference || prefB.noiseTolerance;

  if (noiseA && noiseB && ORDINAL_3[noiseA] && ORDINAL_3[noiseB]) {
    const noiseDiff = Math.abs(ORDINAL_3[noiseA] - ORDINAL_3[noiseB]);
    let noiseFactor = 1.0;
    if (noiseDiff === 0) {
      noiseFactor = 1.0;
      commonPreferences.push(`Both prefer a ${noiseA} room atmosphere`);
    } else if (noiseDiff === 1) {
      noiseFactor = 0.65;
    } else {
      noiseFactor = 0.2;
      differences.push(`Noise: ${noiseA} preference vs ${noiseB}`);
    }

    const catScore = Math.round(noiseFactor * 100);
    applicableWeight += 10;
    weightedPoints += noiseFactor * 10;

    categoryBreakdown.push({
      name: 'Noise & Atmosphere',
      score: catScore,
      factorScore: noiseFactor,
      weight: 10,
      status: catScore >= 85 ? 'Aligned' : catScore >= 60 ? 'Manageable' : 'Conflicting',
      note: noiseDiff === 0 ? 'Aligned sound comfort levels' : 'Headphones recommended during quiet hours',
      isEvaluated: true,
    });
  } else {
    categoryBreakdown.push({
      name: 'Noise & Atmosphere',
      score: null,
      factorScore: null,
      weight: 10,
      status: 'Not Specified',
      note: 'Noise tolerance not declared',
      isEvaluated: false,
    });
  }

  // 6. Study Habits (Weight: 10%)
  const studyA = prefA.studyHabit;
  const studyB = prefB.studyHabit;

  if (studyA && studyB) {
    let studyFactor = 0.5;
    if (studyA === studyB) {
      studyFactor = 1.0;
      commonPreferences.push(`Both prefer ${studyA.replace(/_/g, ' ')} study routine`);
    } else if (studyA === 'library_study' || studyB === 'library_study') {
      studyFactor = 0.8;
    } else {
      studyFactor = 0.35;
      differences.push(`Study Habits: ${studyA.replace(/_/g, ' ')} vs ${studyB.replace(/_/g, ' ')}`);
    }

    const catScore = Math.round(studyFactor * 100);
    applicableWeight += 10;
    weightedPoints += studyFactor * 10;

    categoryBreakdown.push({
      name: 'Study Environment',
      score: catScore,
      factorScore: studyFactor,
      weight: 10,
      status: catScore >= 80 ? 'Compatible' : catScore >= 50 ? 'Good' : 'Divergent',
      note: studyFactor >= 0.8 ? 'Compatible study focus routines' : 'May study in different locations',
      isEvaluated: true,
    });
  } else {
    categoryBreakdown.push({
      name: 'Study Environment',
      score: null,
      factorScore: null,
      weight: 10,
      status: 'Not Specified',
      note: 'Study habits not declared',
      isEvaluated: false,
    });
  }

  // 7. Social Habits & Extroversion (Weight: 10%)
  const socA = prefA.socialLevel || prefA.socialHabit;
  const socB = prefB.socialLevel || prefB.socialHabit;

  if (socA && socB && ORDINAL_3[socA] && ORDINAL_3[socB]) {
    const socDiff = Math.abs(ORDINAL_3[socA] - ORDINAL_3[socB]);
    let socialFactor = 1.0;
    if (socDiff === 0) {
      socialFactor = 1.0;
      commonPreferences.push(`Both identify as ${socA}s`);
    } else if (socDiff === 1) {
      socialFactor = 0.75;
    } else {
      socialFactor = 0.35;
      differences.push(`Social Energy: ${socA} vs ${socB}`);
    }

    const catScore = Math.round(socialFactor * 100);
    applicableWeight += 10;
    weightedPoints += socialFactor * 10;

    categoryBreakdown.push({
      name: 'Social Harmony',
      score: catScore,
      factorScore: socialFactor,
      weight: 10,
      status: catScore >= 80 ? 'Harmonious' : 'Moderate',
      note: socDiff === 0 ? 'Aligned domestic energy levels' : 'Complementary social balance',
      isEvaluated: true,
    });
  } else {
    categoryBreakdown.push({
      name: 'Social Harmony',
      score: null,
      factorScore: null,
      weight: 10,
      status: 'Not Specified',
      note: 'Social habits not declared',
      isEvaluated: false,
    });
  }

  // 8. Other Factors: Smoking & Domestic Policy (Weight: 5%)
  const smokeA = prefA.smokingPreference;
  const smokeB = prefB.smokingPreference;

  if (smokeA && smokeB) {
    let otherFactor = 1.0;
    if (
      (smokeA === 'strictly_non_smoker' && smokeB === 'smoker_friendly') ||
      (smokeB === 'strictly_non_smoker' && smokeA === 'smoker_friendly')
    ) {
      otherFactor = 0.0;
      differences.push('Smoking: Strict non-smoker vs smoker-friendly conflict');
    } else if (smokeA === smokeB) {
      otherFactor = 1.0;
      if (smokeA === 'strictly_non_smoker') {
        commonPreferences.push('Both insist on a 100% smoke-free home');
      }
    } else {
      otherFactor = 0.6;
    }

    const catScore = Math.round(otherFactor * 100);
    applicableWeight += 5;
    weightedPoints += otherFactor * 5;

    categoryBreakdown.push({
      name: 'Domestic Policies',
      score: catScore,
      factorScore: otherFactor,
      weight: 5,
      status: catScore >= 80 ? 'Aligned' : catScore >= 50 ? 'Moderate' : 'Conflict',
      note: otherFactor === 1.0 ? 'Aligned smoking and visitor policies' : 'Discuss house rules before signing',
      isEvaluated: true,
    });
  } else {
    categoryBreakdown.push({
      name: 'Domestic Policies',
      score: null,
      factorScore: null,
      weight: 5,
      status: 'Not Specified',
      note: 'Smoking policy not declared',
      isEvaluated: false,
    });
  }

  // University Campus Bonus note (purely informational)
  if (userA.college && userB.college && userA.college.toLowerCase() === userB.college.toLowerCase()) {
    commonPreferences.push(`Same university campus (${userA.college})`);
  }

  // Compute final score normalized strictly by applicable evaluated weight
  let finalScore = 0;
  if (applicableWeight > 0) {
    finalScore = Math.round((weightedPoints / applicableWeight) * 100);
    // Boundary clamp: strictly [0, 100]
    finalScore = Math.min(100, Math.max(0, finalScore));
  }

  const isPartial = applicableWeight < 100;
  const completenessRatio = Math.round((applicableWeight / 100) * 100);

  // Assign explainable qualitative compatibility level
  let compatibilityLevel = 'Moderate Match';
  if (applicableWeight < 50) {
    compatibilityLevel = 'Insufficient Data';
  } else if (finalScore >= 90) {
    compatibilityLevel = 'Exceptional Match';
  } else if (finalScore >= 80) {
    compatibilityLevel = 'High Compatibility';
  } else if (finalScore >= 70) {
    compatibilityLevel = 'Strong Alignment';
  } else {
    compatibilityLevel = 'Low Compatibility';
  }

  return {
    score: finalScore,
    compatibilityLevel,
    isPartial,
    evaluatedWeight: applicableWeight,
    completenessRatio,
    commonPreferences: commonPreferences.length > 0 ? commonPreferences : ['General roommate compatibility'],
    differences: differences.length > 0 ? differences : ['No major conflicting habits detected'],
    categoryBreakdown,
  };
};

export default { calculateCompatibility, scoreBudget, BUDGET_TIERS, ORDINAL_3 };
