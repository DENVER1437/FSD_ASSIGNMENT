import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Preference, Request, Report } from '../models/index.js';
import { connectDB, disconnectDB } from '../config/db.js';

dotenv.config();

/**
 * Validates whether destructive seeding is permitted.
 * Blocks production execution, blocks remote cloud clusters, requires explicit confirmation,
 * and verifies that the database target is an approved local development/test database.
 */
export const canRunDestructiveSeed = ({
  nodeEnv = process.env.NODE_ENV,
  confirmReset = process.env.CONFIRM_SEED_RESET,
  cliArgs = process.argv.slice(2),
  mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '',
} = {}) => {
  // 1. Refuse in production
  if (nodeEnv === 'production') {
    return {
      allowed: false,
      reason: 'CRITICAL SAFETY BLOCK: Database seeding is strictly forbidden when NODE_ENV is set to "production".',
    };
  }

  // 2. Explicit confirmation required
  const hasConfirmFlag = cliArgs.includes('--confirm') || cliArgs.includes('--force');
  const hasEnvConfirm = confirmReset === 'true' || confirmReset === '1';

  if (!hasConfirmFlag && !hasEnvConfirm) {
    return {
      allowed: false,
      reason: 'SAFETY GUARD: Destructive seeding requires explicit confirmation. Set CONFIRM_SEED_RESET=true or pass --confirm CLI flag.',
    };
  }

  // 3. Database URI validation: Ensure it targets a local/test/dev database
  const normalizedUri = (mongoUri || '').trim().toLowerCase();
  if (!normalizedUri) {
    return {
      allowed: false,
      reason: 'SAFETY GUARD: Target database connection string is empty or unidentified.',
    };
  }

  // Reject remote cloud clusters (e.g. MongoDB Atlas) by default for destructive operations
  const isRemoteCluster = normalizedUri.startsWith('mongodb+srv://') || normalizedUri.includes('.mongodb.net');
  if (isRemoteCluster) {
    return {
      allowed: false,
      reason: 'SAFETY GUARD: Target database connection does not identify an approved local/development/test database.',
    };
  }

  const isLocalHost =
    normalizedUri.includes('localhost') ||
    normalizedUri.includes('127.0.0.1') ||
    normalizedUri.includes('::1');

  if (!isLocalHost) {
    return {
      allowed: false,
      reason: 'SAFETY GUARD: Target database connection does not identify an approved local/development/test database.',
    };
  }

  // Extract and validate database name
  const dbNameMatch = normalizedUri.match(/\/([^/?#]+)(\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : '';
  const approvedDbs = ['nestmatch', 'nestmatch_dev', 'nestmatch_test', 'test'];

  if (!dbName || !approvedDbs.includes(dbName)) {
    return {
      allowed: false,
      reason: `SAFETY GUARD: Target database connection does not identify an approved local/development/test database. Target '${dbName || 'unidentified'}' is not in approved list (${approvedDbs.join(', ')}).`,
    };
  }

  return { allowed: true };
};

const seedDatabase = async () => {
  try {
    const cliArgs = process.argv.slice(2);
    const isResetRequested = cliArgs.includes('--reset') || cliArgs.includes('--destructive');
    const isConfirm =
      cliArgs.includes('--confirm') ||
      cliArgs.includes('--force') ||
      process.env.CONFIRM_SEED_RESET === 'true';

    // 1. Refuse in production
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '\n[Seed Aborted]: CRITICAL SAFETY BLOCK: Database seeding is strictly forbidden when NODE_ENV is set to "production".'
      );
      process.exit(1);
    }

    // 2. Destructive reset safety gate
    let isDestructive = false;
    if (isResetRequested || isConfirm) {
      const guard = canRunDestructiveSeed({ cliArgs });
      if (!guard.allowed) {
        console.error(`\n[Seed Aborted]: ${guard.reason}`);
        console.error('Safe Usage (Development Only):');
        console.error('  Idempotent Demo Data Seed (Non-Destructive): npm run seed (or node scripts/seed.js --upsert)');
        console.error('  Deliberate Full Reset:                      CONFIRM_SEED_RESET=true npm run seed:reset (or node scripts/seed.js --reset --confirm)\n');
        process.exit(1);
      }
      isDestructive = true;
    }

    await connectDB();

    if (isDestructive) {
      console.log('[Seed] Confirmed destructive reset requested. Clearing development collections...');
      await Promise.all([
        User.deleteMany({}),
        Preference.deleteMany({}),
        Request.deleteMany({}),
        Report.deleteMany({}),
      ]);
    } else {
      console.log('[Seed] Idempotent upsert mode active. Preserving existing student accounts and upserting demo data...');
    }

    const defaultPassword = 'Password123!';
    const adminPassword = 'AdminSecret123!';

    // 1. Prepare demo users data (15 Gujarati students at Nirma University & DA-IICT across Ahmedabad, Surat, and Vadodara + Admin)
    console.log('[Seed] Processing 15 Gujarati student profiles at Nirma University & DA-IICT across Ahmedabad, Surat, and Vadodara...');
    const demoUsersData = [
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
        bio: 'EC junior at Nirma. Ambivert, passionate about embedded systems and robotics. Strictly vegetarian, very organized with chores and quiet hours.',
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
        course: 'M.Des Communication Design',
        bio: 'Design student at DA-IICT. Creative, early bird, values cleanliness, good ventilation, and peaceful music while working on UI projects.',
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
        course: 'B.Tech Chemical Engineering',
        bio: 'Chemical engineering student at Nirma. Preparing for GATE, respects silent study hours, enjoys evening campus walks and light conversation.',
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
        city: 'Surat',
        course: 'M.Tech Computer Science',
        bio: 'Graduate student at DA-IICT. Enjoys reading, cooking traditional Gujarati food, and prefers an organized, hygienic apartment.',
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
        course: 'B.Tech Civil Engineering',
        bio: 'Civil engineering senior at Nirma. Cricket enthusiast, friendly, looking for a roommate to share an apartment near campus.',
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
        name: 'Mansi Dave',
        email: 'mansi.dave@daiict.ac.in',
        password: defaultPassword,
        college: 'DA-IICT',
        city: 'Vadodara',
        course: 'B.Tech Artificial Intelligence',
        bio: 'AI student at DA-IICT. Night owl coder, loves filter coffee, quiet study sessions, and keeping shared kitchen and living areas orderly.',
        profileImage: '',
        role: 'student',
        status: 'active',
        isProfileComplete: true,
      },
      {
        name: 'Yash Solanki',
        email: 'yash.solanki@nirmauni.ac.in',
        password: defaultPassword,
        college: 'Nirma University',
        city: 'Ahmedabad',
        course: 'B.Tech Electrical Engineering',
        bio: 'Electrical engineering undergrad at Nirma. Introvert, library regular, looking for a peaceful and budget-friendly room near SG Highway.',
        profileImage: '',
        role: 'student',
        status: 'active',
        isProfileComplete: true,
      },
      {
        name: 'Kruti Panchal',
        email: 'kruti.panchal@daiict.ac.in',
        password: defaultPassword,
        college: 'DA-IICT',
        city: 'Surat',
        course: 'B.Tech Information & Communication Technology',
        bio: 'ICT student at DA-IICT. Strict vegetarian, likes clean kitchen countertops, enjoys coding, reading, and listening to classical music.',
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
      // Admin Account
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

    const users = [];
    for (const userData of demoUsersData) {
      if (isConfirm) {
        const u = await User.create(userData);
        users.push(u);
      } else {
        let u = await User.findOne({ email: userData.email });
        if (u) {
          u.name = userData.name;
          u.college = userData.college;
          u.city = userData.city;
          u.course = userData.course;
          u.bio = userData.bio;
          u.profileImage = userData.profileImage;
          u.role = userData.role;
          u.status = userData.status;
          u.isProfileComplete = userData.isProfileComplete;
          await u.save();
        } else {
          u = await User.create(userData);
        }
        users.push(u);
      }
    }

    const students = users.filter((u) => u.role === 'student');
    const [
      aarav,
      meet,
      dhruv,
      ananya,
      riya,
      harshil,
      pooja,
      rohan,
      diya,
      karan,
      mansi,
      yash,
      kruti,
      parth,
      tanvi,
    ] = students;

    // 2. Create Preferences for all 15 students
    console.log('[Seed] Seeding lifestyle preferences for 15 students...');
    const demoPreferences = [
      {
        userId: aarav._id,
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
        userId: meet._id,
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
        userId: dhruv._id,
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
        userId: ananya._id,
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
        userId: riya._id,
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
      {
        userId: harshil._id,
        budget: '5000-8000',
        sleepSchedule: 'early_bird',
        wakeUpSchedule: 'before_7am',
        productivityRhythm: 'morning',
        cleanliness: 'moderate',
        choreSharing: 'as_needed',
        roomComfort: 'moderate',
        studyHabit: 'in_room_quiet',
        noisePreference: 'silent',
        weekendRoutine: 'reading_and_study',
        socialLevel: 'introvert',
        guestPreference: 'occasional_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'Chandkheda',
      },
      {
        userId: pooja._id,
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
        socialLevel: 'ambivert',
        guestPreference: 'no_overnight_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'Gota',
      },
      {
        userId: rohan._id,
        budget: '8000-12000',
        sleepSchedule: 'night_owl',
        wakeUpSchedule: 'after_9am',
        productivityRhythm: 'evening',
        cleanliness: 'moderate',
        choreSharing: 'flexible_sharing',
        roomComfort: 'cool',
        studyHabit: 'in_room_collaborative',
        noisePreference: 'moderate',
        weekendRoutine: 'outdoor_sports',
        socialLevel: 'extrovert',
        guestPreference: 'frequent_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'Vaishnodevi Circle',
      },
      {
        userId: diya._id,
        budget: '8000-12000',
        sleepSchedule: 'early_bird',
        wakeUpSchedule: 'before_7am',
        productivityRhythm: 'morning',
        cleanliness: 'meticulous',
        choreSharing: 'strict_rotation',
        roomComfort: 'moderate',
        studyHabit: 'in_room_quiet',
        noisePreference: 'silent',
        weekendRoutine: 'reading_and_study',
        socialLevel: 'introvert',
        guestPreference: 'no_overnight_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'SG Highway',
      },
      {
        userId: karan._id,
        budget: '8000-12000',
        sleepSchedule: 'flexible',
        wakeUpSchedule: '7am_9am',
        productivityRhythm: 'afternoon',
        cleanliness: 'moderate',
        choreSharing: 'strict_rotation',
        roomComfort: 'cool',
        studyHabit: 'in_room_collaborative',
        noisePreference: 'moderate',
        weekendRoutine: 'social_and_out',
        socialLevel: 'extrovert',
        guestPreference: 'occasional_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'Bodakdev',
      },
      {
        userId: mansi._id,
        budget: '5000-8000',
        sleepSchedule: 'night_owl',
        wakeUpSchedule: 'after_9am',
        productivityRhythm: 'evening',
        cleanliness: 'meticulous',
        choreSharing: 'clean_as_you_go',
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
        userId: yash._id,
        budget: '<5000',
        sleepSchedule: 'early_bird',
        wakeUpSchedule: 'before_7am',
        productivityRhythm: 'morning',
        cleanliness: 'moderate',
        choreSharing: 'as_needed',
        roomComfort: 'moderate',
        studyHabit: 'library_study',
        noisePreference: 'silent',
        weekendRoutine: 'reading_and_study',
        socialLevel: 'introvert',
        guestPreference: 'no_overnight_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'Gota',
      },
      {
        userId: kruti._id,
        budget: '5000-8000',
        sleepSchedule: 'early_bird',
        wakeUpSchedule: '7am_9am',
        productivityRhythm: 'morning',
        cleanliness: 'meticulous',
        choreSharing: 'strict_rotation',
        roomComfort: 'moderate',
        studyHabit: 'in_room_quiet',
        noisePreference: 'silent',
        weekendRoutine: 'reading_and_study',
        socialLevel: 'ambivert',
        guestPreference: 'occasional_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'SG Highway',
      },
      {
        userId: parth._id,
        budget: '5000-8000',
        sleepSchedule: 'flexible',
        wakeUpSchedule: '7am_9am',
        productivityRhythm: 'afternoon',
        cleanliness: 'moderate',
        choreSharing: 'strict_rotation',
        roomComfort: 'cool',
        studyHabit: 'in_room_quiet',
        noisePreference: 'moderate',
        weekendRoutine: 'outdoor_sports',
        socialLevel: 'ambivert',
        guestPreference: 'occasional_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'Chandkheda',
      },
      {
        userId: tanvi._id,
        budget: '8000-12000',
        sleepSchedule: 'flexible',
        wakeUpSchedule: '7am_9am',
        productivityRhythm: 'morning',
        cleanliness: 'meticulous',
        choreSharing: 'clean_as_you_go',
        roomComfort: 'cool',
        studyHabit: 'in_room_music',
        noisePreference: 'moderate',
        weekendRoutine: 'social_and_out',
        socialLevel: 'extrovert',
        guestPreference: 'occasional_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'SG Highway',
      },
    ];

    for (const pref of demoPreferences) {
      if (isConfirm) {
        await Preference.create(pref);
      } else {
        await Preference.findOneAndUpdate(
          { userId: pref.userId },
          { $set: pref },
          { upsert: true, new: true, runValidators: true }
        );
      }
    }

    // 3. Create Seed Requests
    console.log('[Seed] Seeding roommate requests...');
    const demoRequests = [
      {
        senderId: meet._id,
        receiverId: aarav._id,
        status: 'accepted',
        message: 'Namaste Aarav! Our compatibility is 94% on NestMatch. We both study at Nirma and prefer clean study spaces. Would you like to share a flat near SG Highway?',
      },
      {
        senderId: dhruv._id,
        receiverId: aarav._id,
        status: 'pending',
        message: 'Hi Aarav! Saw your profile from Nirma. We both prioritize quiet morning routines and pure vegetarian living.',
      },
      {
        senderId: aarav._id,
        receiverId: harshil._id,
        status: 'pending',
        message: 'Hi Harshil! Saw your GATE prep profile. Wondering if you would like to look for places near Vaishnodevi Circle?',
      },
    ];

    for (const reqData of demoRequests) {
      const activePairKey = [reqData.senderId.toString(), reqData.receiverId.toString()].sort().join(':');
      if (isConfirm) {
        await Request.create({ ...reqData, activePairKey });
      } else {
        const existing = await Request.findOne({
          $or: [
            { senderId: reqData.senderId, receiverId: reqData.receiverId },
            { senderId: reqData.receiverId, receiverId: reqData.senderId },
          ],
        });
        if (!existing) {
          await Request.create({ ...reqData, activePairKey });
        }
      }
    }
    // 4. Create Seed Moderation Reports for Admin view
    console.log('[Seed] Seeding safety moderation reports...');
    const demoReports = [
      {
        reporterId: dhruv._id,
        reportedUserId: rohan._id,
        reason: 'Misrepresented apartment rules regarding late-night noise',
        description: 'Candidate stated quiet study hours, but mentioned hosting late-night parties during exams.',
        severity: 'medium',
        status: 'open',
      },
      {
        reporterId: ananya._id,
        reportedUserId: karan._id,
        reason: 'Repeated inquiries regarding guest policy',
        description: 'Sent multiple messages asking about overnight party allowances after preference was set to no overnight guests.',
        severity: 'low',
        status: 'investigating',
      },
    ];

    for (const repData of demoReports) {
      if (isConfirm) {
        await Report.create(repData);
      } else {
        const existingRep = await Report.findOne({ reporterId: repData.reporterId, reportedUserId: repData.reportedUserId });
        if (!existingRep) {
          await Report.create(repData);
        }
      }
    }

    console.log('[Seed] Database successfully synchronized with 15 Nirma University Gujarati students!');
    console.log('---------------------------------------------------------');
    console.log('Demo Student: aarav.patel@nirmauni.ac.in / Password123!');
    console.log('Demo Admin:   admin@nestmatch.edu / AdminSecret123!');
    console.log('---------------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

export { seedDatabase };

// Only run automatically when executed directly from CLI
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('seed.js') || process.argv[1].endsWith('seed'));

if (isDirectExecution) {
  seedDatabase();
}
