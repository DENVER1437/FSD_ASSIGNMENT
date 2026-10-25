import { User, Preference } from '../models/index.js';

const defaultPassword = 'Password123!';
const adminPassword = 'AdminSecret123!';

const demoUsers = [
  {
    name: 'Aarav Patel',
    email: 'aarav.patel@nirmauni.ac.in',
    password: defaultPassword,
    college: 'Nirma University',
    city: 'Ahmedabad',
    course: 'B.Tech Computer Science & Engineering',
    bio: 'CS student at Institute of Technology, Nirma University. Early riser who loves morning tea, competitive programming, and keeping the study room clean.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Meet Kotecha',
    email: 'meet.kotecha@nirmauni.ac.in',
    password: defaultPassword,
    college: 'Nirma University',
    city: 'Ahmedabad',
    course: 'B.Tech Information Technology',
    bio: 'IT sophomore at Nirma University. Night owl developer, loves full-stack web development and hackathons. Looking for a neat flatmate near SG Highway.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Dhruv Shah',
    email: 'dhruv.shah@daiict.ac.in',
    password: defaultPassword,
    college: 'DA-IICT',
    city: 'Surat',
    course: 'B.Tech Information & Communication Technology',
    bio: 'ICT student at DA-IICT. Weekend badminton player, pure vegetarian, looking for a quiet study environment with neat flatmates.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Ananya Mehta',
    email: 'ananya.mehta@nirmauni.ac.in',
    password: defaultPassword,
    college: 'Nirma University',
    city: 'Surat',
    course: 'B.Tech Electronics & Communication',
    bio: 'EC student at Nirma. Passionate about robotics, classical music, and prefers early lights-out and tidy common areas.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Riya Joshi',
    email: 'riya.joshi@daiict.ac.in',
    password: defaultPassword,
    college: 'DA-IICT',
    city: 'Vadodara',
    course: 'M.Sc Data Science',
    bio: 'Data Science master student at DA-IICT. Early morning runner, enjoys calm study evenings and home-cooked Gujarati food.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Harshil Desai',
    email: 'harshil.desai@nirmauni.ac.in',
    password: defaultPassword,
    college: 'Nirma University',
    city: 'Ahmedabad',
    course: 'B.Tech Mechanical Engineering',
    bio: 'Mechanical engineering enthusiast at Nirma. Formula Student team member, early riser, values cleanliness and shared responsibilities.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Pooja Trivedi',
    email: 'pooja.trivedi@daiict.ac.in',
    password: defaultPassword,
    college: 'DA-IICT',
    city: 'Ahmedabad',
    course: 'B.Tech ICT with minors in CS',
    bio: 'ICT student at DA-IICT. Avid reader, plant enthusiast, maintains a calm and respectful living space.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Rohan Parikh',
    email: 'rohan.parikh@nirmauni.ac.in',
    password: defaultPassword,
    college: 'Nirma University',
    city: 'Vadodara',
    course: 'B.Tech Chemical Engineering',
    bio: 'Chemical engineering student at Nirma. Night owl, coffee lover, active in campus cultural committee.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Diya Bhatt',
    email: 'diya.bhatt@daiict.ac.in',
    password: defaultPassword,
    college: 'DA-IICT',
    city: 'Ahmedabad',
    course: 'B.Tech Mathematics & Computing',
    bio: 'Computing student at DA-IICT. Parliamentary debater, early riser, values mutual respect and keeps shared spaces spotless.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Karan Vora',
    email: 'karan.vora@nirmauni.ac.in',
    password: defaultPassword,
    college: 'Nirma University',
    city: 'Surat',
    course: 'Integrated BBA-MBA',
    bio: 'Management student at Institute of Management, Nirma University. Enthusiastic, respects privacy and study routines, enjoys weekend sports.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Mansi Panchal',
    email: 'mansi.panchal@daiict.ac.in',
    password: defaultPassword,
    college: 'DA-IICT',
    city: 'Ahmedabad',
    course: 'B.Tech Design & Computing',
    bio: 'UI/UX enthusiast at DA-IICT. Weekend painter, minimalist living advocate, looking for friendly and considerate flatmates.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Yash Gajjar',
    email: 'yash.gajjar@nirmauni.ac.in',
    password: defaultPassword,
    college: 'Nirma University',
    city: 'Ahmedabad',
    course: 'B.Tech Civil Engineering',
    bio: 'Civil engineering student at Nirma. Early morning jogger, disciplined student, non-smoker seeking studious roommates near campus.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Kruti Soni',
    email: 'kruti.soni@daiict.ac.in',
    password: defaultPassword,
    college: 'DA-IICT',
    city: 'Surat',
    course: 'M.Tech Software Systems',
    bio: 'Software Systems student at DA-IICT. Quiet and focused, enjoys reading and weekend yoga, keeps personal and shared areas neat.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Parth Raval',
    email: 'parth.raval@nirmauni.ac.in',
    password: defaultPassword,
    college: 'Nirma University',
    city: 'Vadodara',
    course: 'B.Tech Information Technology',
    bio: 'IT student at Nirma. Table tennis player, focused on software development and maintaining a peaceful, smoke-free room atmosphere.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'Tanvi Shukla',
    email: 'tanvi.shukla@daiict.ac.in',
    password: defaultPassword,
    college: 'DA-IICT',
    city: 'Ahmedabad',
    course: 'B.Tech Computational Science',
    bio: 'Computational Science student at DA-IICT. Sociable, loves indoor plants, values honest communication and clean shared living spaces.',
    profileImage: '',
    role: 'student',
    status: 'active',
    isProfileComplete: true,
  },
  {
    name: 'System Administrator',
    email: 'admin@nestmatch.edu',
    password: adminPassword,
    college: 'Nirma University Administration',
    city: 'Ahmedabad',
    course: 'Platform Safety',
    bio: 'Verified administrator account for Nirma University moderation, safety management, and system health oversight.',
    profileImage: '',
    role: 'admin',
    status: 'active',
    isProfileComplete: true,
  },
];

const studentPreferenceTemplates = [
  {
    budget: '5000-8000',
    sleepSchedule: 'early_bird',
    wakeUpSchedule: 'before_7am',
    productivityRhythm: 'morning',
    cleanliness: 'meticulous',
    choreSharing: 'strict_rotation',
    roomComfort: 'cool',
    studyHabit: 'in_room_quiet',
    noisePreference: 'silent',
    weekendRoutine: 'relax_and_code',
    socialLevel: 'ambivert',
    guestPreference: 'occasional_guests',
    smokingPreference: 'strictly_non_smoker',
    foodPreference: 'vegetarian',
    preferredLocation: 'SG Highway',
  },
  {
    budget: '5000-8000',
    sleepSchedule: 'night_owl',
    wakeUpSchedule: 'after_9am',
    productivityRhythm: 'evening',
    cleanliness: 'meticulous',
    choreSharing: 'strict_rotation',
    roomComfort: 'cool',
    studyHabit: 'in_room_quiet',
    noisePreference: 'moderate',
    weekendRoutine: 'relax_and_code',
    socialLevel: 'ambivert',
    guestPreference: 'occasional_guests',
    smokingPreference: 'strictly_non_smoker',
    foodPreference: 'vegetarian',
    preferredLocation: 'SG Highway',
  },
  {
    budget: '5000-8000',
    sleepSchedule: 'flexible',
    wakeUpSchedule: '7am_9am',
    productivityRhythm: 'morning',
    cleanliness: 'meticulous',
    choreSharing: 'strict_rotation',
    roomComfort: 'moderate',
    studyHabit: 'library_study',
    noisePreference: 'silent',
    weekendRoutine: 'outdoor_sports',
    socialLevel: 'ambivert',
    guestPreference: 'occasional_guests',
    smokingPreference: 'strictly_non_smoker',
    foodPreference: 'vegetarian',
    preferredLocation: 'Gota',
  },
  {
    budget: '5000-8000',
    sleepSchedule: 'flexible',
    wakeUpSchedule: '7am_9am',
    productivityRhythm: 'morning',
    cleanliness: 'meticulous',
    choreSharing: 'strict_rotation',
    roomComfort: 'moderate',
    studyHabit: 'library_study',
    noisePreference: 'silent',
    weekendRoutine: 'reading_and_study',
    socialLevel: 'introvert',
    guestPreference: 'no_overnight_guests',
    smokingPreference: 'strictly_non_smoker',
    foodPreference: 'vegetarian',
    preferredLocation: 'Vaishnodevi Circle',
  },
  {
    budget: '8000-12000',
    sleepSchedule: 'early_bird',
    wakeUpSchedule: 'before_7am',
    productivityRhythm: 'morning',
    cleanliness: 'meticulous',
    choreSharing: 'clean_as_you_go',
    roomComfort: 'cool',
    studyHabit: 'in_room_music',
    noisePreference: 'moderate',
    weekendRoutine: 'reading_and_study',
    socialLevel: 'ambivert',
    guestPreference: 'occasional_guests',
    smokingPreference: 'strictly_non_smoker',
    foodPreference: 'vegetarian',
    preferredLocation: 'SG Highway',
  },
];

/**
 * Idempotently ensures demo accounts (admin and Gujarati student profiles)
 * exist in the database so that 1-click fill and matching always work.
 */
export const ensureDemoData = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@nestmatch.edu' });
    if (existingAdmin) {
      return; // Already initialized
    }

    console.log('[Auto-Seed] Initializing demo student profiles and admin account for 1-click access...');

    for (let i = 0; i < demoUsers.length; i++) {
      const userData = demoUsers[i];
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
      }

      // If user is a student, ensure they have lifestyle preferences for compatibility matching
      if (user.role === 'student') {
        const existingPref = await Preference.findOne({ userId: user._id });
        if (!existingPref) {
          const template = studentPreferenceTemplates[i % studentPreferenceTemplates.length];
          await Preference.create({
            userId: user._id,
            ...template,
          });
        }
      }
    }

    console.log('[Auto-Seed] Demo accounts & matching preferences successfully loaded into database.');
  } catch (error) {
    console.error('[Auto-Seed Warning]: Non-fatal error while initializing demo users:', error.message);
  }
};
