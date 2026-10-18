import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { useMatch } from '../context/MatchContext';
import { useToast } from '../context/ToastContext';

export function QuestionnairePage() {
  const { preferences, submitQuestionnaire } = useMatch();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Initial answers with explicit empty/unanswered states
  const [answers, setAnswers] = useState(() => ({
    // Step 1: Daily Rhythm & Sleep
    sleepSchedule: preferences?.sleepSchedule || '',
    wakeUpSchedule: preferences?.wakeUpSchedule || '',
    productivityRhythm: preferences?.productivityRhythm || '',
    // Step 2: Cleanliness & Chores
    cleanliness: preferences?.cleanliness || '',
    choreSharing: preferences?.choreSharing || '',
    roomComfort: preferences?.roomComfort || '',
    // Step 3: Atmosphere & Study
    studyHabit: preferences?.studyHabit || '',
    noisePreference: preferences?.noisePreference || '',
    weekendRoutine: preferences?.weekendRoutine || '',
    // Step 4: Social & House Rules
    socialLevel: preferences?.socialLevel || '',
    guestPreference: preferences?.guestPreference || '',
    smokingPreference: preferences?.smokingPreference || '',
    // Step 5: Budget & Dietary
    budget: preferences?.budget || '',
    foodPreference: preferences?.foodPreference || '',
    preferredLocation: preferences?.preferredLocation || '',
  }));

  // Synchronize asynchronously loaded preferences without overwriting unsaved user edits
  useEffect(() => {
    if (preferences && !isDirty) {
      setAnswers({
        sleepSchedule: preferences.sleepSchedule || '',
        wakeUpSchedule: preferences.wakeUpSchedule || '',
        productivityRhythm: preferences.productivityRhythm || '',
        cleanliness: preferences.cleanliness || '',
        choreSharing: preferences.choreSharing || '',
        roomComfort: preferences.roomComfort || '',
        studyHabit: preferences.studyHabit || '',
        noisePreference: preferences.noisePreference || '',
        weekendRoutine: preferences.weekendRoutine || '',
        socialLevel: preferences.socialLevel || '',
        guestPreference: preferences.guestPreference || '',
        smokingPreference: preferences.smokingPreference || '',
        budget: preferences.budget || '',
        foodPreference: preferences.foodPreference || '',
        preferredLocation: preferences.preferredLocation || '',
      });
    }
  }, [preferences, isDirty]);

  const handleSelect = (field, value) => {
    setIsDirty(true);
    setAnswers((prev) => ({ ...prev, [field]: value }));
    // Clear validation error on selection
    if (stepErrors[field]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setSubmitError(null);
  };

  const steps = [
    {
      title: 'Daily Sleep & Morning Rhythms',
      description: 'Synchronizing sleep routines eliminates over 60% of common roommate conflicts.',
      questions: [
        {
          id: 'sleepSchedule',
          label: '1. What is your typical bedtime routine?',
          required: true,
          options: [
            { value: 'early_bird', label: 'Early Bird', detail: 'Asleep before 11:00 PM' },
            { value: 'night_owl', label: 'Night Owl', detail: 'Productive and awake past midnight' },
            { value: 'flexible', label: 'Flexible', detail: 'Variable depending on assignment deadlines' },
          ],
        },
        {
          id: 'wakeUpSchedule',
          label: '2. When do you usually wake up on weekdays?',
          required: true,
          options: [
            { value: 'before_7am', label: 'Early Riser', detail: 'Up before 7:00 AM' },
            { value: '7am_9am', label: 'Standard Morning', detail: 'Between 7:00 AM and 9:00 AM' },
            { value: 'after_9am', label: 'Late Morning', detail: 'After 9:00 AM' },
          ],
        },
        {
          id: 'productivityRhythm',
          label: '3. When are your peak energy and study hours?',
          required: false,
          options: [
            { value: 'morning', label: 'Morning Peak', detail: 'Best focus before noon' },
            { value: 'afternoon', label: 'Afternoon Peak', detail: 'Best focus between 1 PM and 6 PM' },
            { value: 'evening', label: 'Late Night Peak', detail: 'Best focus in peaceful late hours' },
          ],
        },
      ],
    },
    {
      title: 'Cleanliness & Shared Space Habits',
      description: 'Clear expectations on dishes, clutter, and common area upkeep.',
      questions: [
        {
          id: 'cleanliness',
          label: '4. What is your domestic cleanliness comfort level?',
          required: true,
          options: [
            { value: 'meticulous', label: 'Meticulous', detail: 'Countertops wiped daily, sink empty, chore list' },
            { value: 'moderate', label: 'Moderate', detail: 'Kept tidy overall, deep clean on weekends' },
            { value: 'relaxed', label: 'Relaxed', detail: 'Comfortable with lived-in clutter' },
          ],
        },
        {
          id: 'choreSharing',
          label: '5. How do you prefer to manage apartment chores?',
          required: true,
          options: [
            { value: 'strict_rotation', label: 'Scheduled Rotation', detail: 'Assigned weekly chore rotation calendar' },
            { value: 'clean_as_you_go', label: 'Immediate Cleanup', detail: 'Clean up personal messes immediately' },
            { value: 'hire_cleaner', label: 'Shared Cleaning Service', detail: 'Open to splitting occasional deep cleaning' },
          ],
        },
        {
          id: 'roomComfort',
          label: '6. What room temperature do you prefer when resting?',
          required: false,
          options: [
            { value: 'cool', label: 'Cool / AC Active', detail: 'Prefer a cold room (68°F / 20°C or below)' },
            { value: 'moderate', label: 'Mild / Ambient', detail: 'Balanced around 72°F / 22°C' },
            { value: 'warm', label: 'Warm & Cozy', detail: 'Dislike heavy air conditioning' },
          ],
        },
      ],
    },
    {
      title: 'Study Habits & Noise Expectations',
      description: 'Establishing mutual study hours and sound comfort levels in shared rooms.',
      questions: [
        {
          id: 'studyHabit',
          label: '7. Where and how do you prefer to study?',
          required: true,
          options: [
            { value: 'in_room_quiet', label: 'Quiet Bedroom Desk', detail: 'Need undisturbed room focus' },
            { value: 'in_room_music', label: 'Background Audio', detail: 'Comfortable with music or low background hum' },
            { value: 'library_study', label: 'Campus Libraries', detail: 'Study mostly outside; room is just for sleep' },
          ],
        },
        {
          id: 'noisePreference',
          label: '8. What is your noise tolerance during the day?',
          required: true,
          options: [
            { value: 'silent', label: 'Strict Silence', detail: 'Headphones expected for all media' },
            { value: 'moderate', label: 'Normal Daytime Living', detail: 'Occasional calls and TV at modest volume' },
            { value: 'tolerant', label: 'High Tolerance', detail: 'Unbothered by conversational chatter' },
          ],
        },
        {
          id: 'weekendRoutine',
          label: '9. How do you typically spend your weekends?',
          required: false,
          options: [
            { value: 'relax_and_code', label: 'Relaxing / Working', detail: 'Quiet downtime, hobbies, gaming' },
            { value: 'outdoors', label: 'Out and About', detail: 'Out with friends or sports most of the weekend' },
            { value: 'hybrid', label: 'Balanced Mix', detail: 'Half study, half social outings' },
          ],
        },
      ],
    },
    {
      title: 'Social Life, Guests & Lifestyle Policies',
      description: 'Respecting personal boundaries regarding guests and habits.',
      questions: [
        {
          id: 'socialLevel',
          label: '10. How would you describe your social battery?',
          required: true,
          options: [
            { value: 'introvert', label: 'Introverted', detail: 'Home is a sanctuary for quiet recovery' },
            { value: 'ambivert', label: 'Ambivert', detail: 'Enjoy occasional company and quiet time' },
            { value: 'extrovert', label: 'Extroverted', detail: 'Energized by frequent social interaction' },
          ],
        },
        {
          id: 'guestPreference',
          label: '11. What is your policy on overnight visitors and friends?',
          required: true,
          options: [
            { value: 'occasional_guests', label: 'Occasional Guests', detail: 'Welcome with prior notice to roommates' },
            { value: 'no_overnight_guests', label: 'Strict Privacy', detail: 'No overnight guests in shared spaces' },
            { value: 'open_house', label: 'Open Hospitality', detail: 'Friends and study groups regularly welcome' },
          ],
        },
        {
          id: 'smokingPreference',
          label: '12. What is your policy regarding smoking or vaping?',
          required: true,
          options: [
            { value: 'strictly_non_smoker', label: 'Strictly Smoke-Free', detail: 'Zero tolerance inside the apartment' },
            { value: 'outside_only', label: 'Balcony / Outdoor Only', detail: 'Permitted outside the building only' },
            { value: 'tolerant', label: 'Tolerant', detail: 'No strict preference' },
          ],
        },
      ],
    },
    {
      title: 'Budget & Kitchen Harmony',
      description: 'Essential financial parameters and dietary compatibility.',
      questions: [
        {
          id: 'budget',
          label: '13. What is your target monthly rent budget per person?',
          required: true,
          options: [
            { value: '<5000', label: 'Under $5,000', detail: 'Economy shared rooms and student housing' },
            { value: '5000-8000', label: '$5,000 – $8,000', detail: 'Standard 2BHK/3BHK shared flat range' },
            { value: '8000-12000', label: '$8,000 – $12,000', detail: 'Premium modern apartment near transit' },
            { value: '12000+', label: '$12,000+', detail: 'High-end apartments with luxury amenities' },
          ],
        },
        {
          id: 'foodPreference',
          label: '14. What are your cooking and dietary habits?',
          required: true,
          options: [
            { value: 'vegetarian', label: 'Vegetarian Only', detail: 'Vegetarian diet and kitchen cookware' },
            { value: 'eggetarian', label: 'Eggetarian', detail: 'Vegetables & eggs; no meat' },
            { value: 'non_vegetarian', label: 'Non-Vegetarian', detail: 'Comfortable with all food prep' },
            { value: 'vegan', label: 'Plant-Based Vegan', detail: 'Strictly plant-based lifestyle' },
          ],
        },
        {
          id: 'preferredLocation',
          label: '15. What is your preferred campus commute location?',
          required: false,
          options: [
            { value: 'University District', label: 'Walking Distance', detail: 'Under 15 minutes walk to campus' },
            { value: 'Downtown / Metro', label: 'Subway / Transit Line', detail: 'Near subway/bus stop within 25 mins' },
            { value: 'Quiet Suburbs', label: 'Quiet Outer Ring', detail: 'Spacious residential neighborhood' },
          ],
        },
      ],
    },
  ];

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];

  // Total questions answered count out of 15
  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((val) => typeof val === 'string' && val.trim() !== '').length;
  }, [answers]);

  const progressPercent = Math.round((answeredCount / 15) * 100);

  const validateCurrentStep = () => {
    const errors = {};
    currentStepData.questions.forEach((q) => {
      if (q.required && (!answers[q.id] || answers[q.id].trim() === '')) {
        errors[q.id] = 'This question requires an answer.';
      }
    });
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      showToast('Please answer all required questions on this step before proceeding.', 'error');
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    // Validate current step first
    if (!validateCurrentStep()) {
      showToast('Please answer all required questions on this step.', 'error');
      return;
    }

    // Validate all required questions across all steps
    const missing = [];
    steps.forEach((st, sIdx) => {
      st.questions.forEach((q) => {
        if (q.required && (!answers[q.id] || answers[q.id].trim() === '')) {
          missing.push({ step: sIdx + 1, stepIndex: sIdx, label: q.label });
        }
      });
    });

    if (missing.length > 0) {
      const firstMissing = missing[0];
      showToast(`Incomplete questionnaire: Step ${firstMissing.step} has unanswered required questions.`, 'error');
      setCurrentStep(firstMissing.stepIndex);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitQuestionnaire(answers);
      if (res && res.success) {
        setIsCompleted(true);
        setIsDirty(false);
        showToast('Lifestyle preferences saved successfully! Compatibility scores updated.', 'success');
      } else {
        const errorMsg = res?.message || 'Failed to save questionnaire. Please try again.';
        setSubmitError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save questionnaire. Please try again.';
      setSubmitError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
            Questionnaire Saved!
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Your 15 lifestyle parameters have been updated. Our weighted compatibility engine has re-ranked your potential roommate pool.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 text-left max-w-md mx-auto shadow-subtle space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal">
            Saved Snapshot
          </div>
          <div className="text-xs text-stone-600 space-y-1.5">
            <div>• <strong className="text-charcoal">Sleep:</strong> {answers.sleepSchedule} (Peak: {answers.productivityRhythm || 'Not specified'})</div>
            <div>• <strong className="text-charcoal">Cleanliness:</strong> {answers.cleanliness} ({answers.choreSharing || 'Standard'})</div>
            <div>• <strong className="text-charcoal">Budget:</strong> {answers.budget} rent range</div>
            <div>• <strong className="text-charcoal">Diet:</strong> {answers.foodPreference}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => navigate('/matches')}
            size="lg"
            className="w-full sm:w-auto"
          >
            <span>View Updated Matches</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsCompleted(false);
              setCurrentStep(0);
            }}
            size="lg"
            icon={RotateCcw}
            className="w-full sm:w-auto"
          >
            Review Answers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Compatibility Questionnaire"
        subtitle="15 questions across sleep, cleanliness, budget, and habits to calculate explainable roommate scores."
        badge={
          <span className="text-xs font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
            {answeredCount} of 15 Answered ({progressPercent}%)
          </span>
        }
      />

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((st, idx) => {
          const isCurrent = idx === currentStep;
          const isStepFullyAnswered = st.questions.every((q) => Boolean(answers[q.id]));
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentStep(idx);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-2.5 rounded-xl border text-center transition ${
                isCurrent
                  ? 'border-brand-600 bg-brand-50/70 text-brand-900 font-bold'
                  : isStepFullyAnswered
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                  : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-50'
              }`}
            >
              <div className="text-[11px] uppercase tracking-wider font-semibold">
                Step {idx + 1}
              </div>
              <div className="text-[10px] truncate hidden sm:block mt-0.5 font-normal">
                {st.title.split(' ')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
          <span className="font-semibold text-charcoal">{currentStepData.title}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Error Alert if Submission Failed */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="underline font-bold text-rose-900 hover:text-rose-950 ml-3 shrink-0"
          >
            Retry Save
          </button>
        </div>
      )}

      {/* Questionnaire Form Card */}
      <Card className="p-6 sm:p-8 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-charcoal">
            {currentStepData.title}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {currentStepData.description}
          </p>
        </div>

        {/* Questions in Current Step */}
        <div className="space-y-8">
          {currentStepData.questions.map((q) => {
            const hasError = Boolean(stepErrors[q.id]);
            return (
              <div key={q.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-charcoal">
                    {q.label}
                    {q.required ? (
                      <span className="text-rose-500 ml-1 font-semibold" title="Required">*</span>
                    ) : (
                      <span className="text-[11px] text-stone-400 font-normal ml-1.5">(Optional)</span>
                    )}
                  </label>
                  {hasError && (
                    <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Answer required
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label={q.label}>
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelect(q.id, opt.value)}
                        className={`text-left p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/70 text-brand-900 shadow-sm ring-1 ring-brand-600'
                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-bold text-sm text-charcoal">
                            {opt.label}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-brand-600 bg-brand-600 text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-snug">
                          {opt.detail}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-100">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0 || submitting}
            icon={ArrowLeft}
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            loading={submitting}
            className="gap-2"
          >
            <span>
              {submitting
                ? 'Saving Preferences...'
                : currentStep === totalSteps - 1
                ? 'Save & Calculate Matches'
                : 'Next Step'}
            </span>
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default QuestionnairePage;
