import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Preference, Request, Message, Report } from '../models/index.js';
import { connectDB, disconnectDB } from '../config/db.js';

dotenv.config();

/**
 * Validates whether destructive seeding is permitted.
 * Blocks production execution and requires explicit confirmation.
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
  const normalizedUri = (mongoUri || '').toLowerCase();
  const isApprovedTarget =
    normalizedUri.includes('localhost') ||
    normalizedUri.includes('127.0.0.1') ||
    normalizedUri.includes('test') ||
    normalizedUri.includes('dev') ||
    normalizedUri.includes('nestmatch');

  if (!isApprovedTarget) {
    return {
      allowed: false,
      reason: 'SAFETY GUARD: Target database connection does not identify an approved local/development/test database.',
    };
  }

  return { allowed: true };
};

const seedDatabase = async () => {
  try {
    const guard = canRunDestructiveSeed();
    if (!guard.allowed) {
      console.error(`\n[Seed Aborted]: ${guard.reason}`);
      console.error('Safe Usage (Development Only):');
      console.error('  CONFIRM_SEED_RESET=true node scripts/seed.js');
      console.error('  or: npm run seed -- --confirm\n');
      process.exit(1);
    }

    await connectDB();
    console.log('[Seed] Connected to authorized development database. Proceeding with demo seed...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Preference.deleteMany({}),
      Request.deleteMany({}),
      Message.deleteMany({}),
      Report.deleteMany({}),
    ]);

    const defaultPassword = 'Password123!';
    const adminPassword = 'AdminSecret123!';

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const users = await User.create([
      {
        name: 'Alex Johnson',
        email: 'alex@university.edu',
        password: defaultPassword,
        college: 'Apex Institute of Technology',
        city: 'Boston',
        course: 'B.Tech Computer Science',
        bio: 'Junior studying CS. Night owl who values cleanliness and quiet coding hours. Looking for a roommate to share an apartment near campus.',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        role: 'student',
        status: 'active',
        isProfileComplete: true,
      },
      {
        name: 'Jordan Lee',
        email: 'jordan@university.edu',
        password: defaultPassword,
        college: 'Apex Institute of Technology',
        city: 'Boston',
        course: 'B.S. Data Science',
        bio: 'Software enthusiast and night owl. Love indie music, weekend gaming, and keeping the kitchen spotless.',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
        role: 'student',
        status: 'active',
        isProfileComplete: true,
      },
      {
        name: 'Priya Sharma',
        email: 'priya@university.edu',
        password: defaultPassword,
        college: 'Apex Institute of Technology',
        city: 'Boston',
        course: 'B.Tech Information Technology',
        bio: 'Focused on academics and library study hours. Strict vegetarian, morning tea lover, very organized with chores.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
        role: 'student',
        status: 'active',
        isProfileComplete: true,
      },
      {
        name: 'Marcus Chen',
        email: 'marcus@university.edu',
        password: defaultPassword,
        college: 'Metro State University',
        city: 'Boston',
        course: 'B.Arch Architecture',
        bio: 'Architecture student with studio model projects. Early riser who spends weekends outdoors and enjoys quiet study rooms.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        role: 'student',
        status: 'active',
        isProfileComplete: true,
      },
      {
        name: 'Samira Patel',
        email: 'samira@university.edu',
        password: defaultPassword,
        college: 'Apex Institute of Technology',
        city: 'Cambridge',
        course: 'M.S. Biotechnology',
        bio: 'Biotech researcher with flexible lab schedules. Sociable, loves cooking dinner with roommates and listening to podcasts.',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
        role: 'student',
        status: 'active',
        isProfileComplete: true,
      },
      {
        name: 'Liam O\'Connor',
        email: 'liam@university.edu',
        password: defaultPassword,
        college: 'Bay Area State College',
        city: 'Boston',
        course: 'B.A. Economics',
        bio: 'Economics major. Social extrovert, enjoys hosting weekend dinners and watching sports. Relaxed about chores.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        role: 'student',
        status: 'active',
        isProfileComplete: true,
      },
      // Admin Account
      {
        name: 'System Administrator',
        email: 'admin@nestmatch.edu',
        password: adminPassword,
        college: 'NestMatch Administration',
        city: 'Boston',
        course: 'Platform Safety',
        bio: 'Verified administrator account for university moderation, safety management, and system health oversight.',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
        role: 'admin',
        status: 'active',
        isProfileComplete: true,
      },
    ]);

    const [alex, jordan, priya, marcus, samira, liam] = users;

    // 2. Create Preferences
    console.log('[Seed] Seeding lifestyle preferences...');
    await Preference.create([
      {
        userId: alex._id,
        budget: '5000-8000',
        sleepSchedule: 'night_owl',
        wakeUpSchedule: 'after_9am',
        productivityRhythm: 'evening',
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
        preferredLocation: 'University District',
      },
      {
        userId: jordan._id,
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
        preferredLocation: 'University District',
      },
      {
        userId: priya._id,
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
        preferredLocation: 'Campus North',
      },
      {
        userId: marcus._id,
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
        foodPreference: 'any',
        preferredLocation: 'Downtown',
      },
      {
        userId: samira._id,
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
        socialLevel: 'ambivert',
        guestPreference: 'occasional_guests',
        smokingPreference: 'strictly_non_smoker',
        foodPreference: 'vegetarian',
        preferredLocation: 'Cambridge Center',
      },
      {
        userId: liam._id,
        budget: '8000-12000',
        sleepSchedule: 'night_owl',
        wakeUpSchedule: 'after_9am',
        productivityRhythm: 'evening',
        cleanliness: 'relaxed',
        choreSharing: 'as_needed',
        roomComfort: 'warm',
        studyHabit: 'in_room_collaborative',
        noisePreference: 'lively',
        weekendRoutine: 'social_and_out',
        socialLevel: 'extrovert',
        guestPreference: 'frequent_guests',
        smokingPreference: 'outdoor_only',
        foodPreference: 'non_vegetarian',
        preferredLocation: 'South End',
      },
    ]);

    // 3. Create Seed Requests & Messages
    console.log('[Seed] Seeding roommate requests and message threads...');
    // Connected pair: Alex <-> Jordan
    const reqAccepted = await Request.create({
      senderId: jordan._id,
      receiverId: alex._id,
      status: 'accepted',
      message: 'Hey Alex! Our compatibility score is 94%. We have identical sleep and cleanliness routines. Let us team up for an apartment!',
    });

    // Seed conversation messages for Alex & Jordan
    await Message.create([
      {
        senderId: jordan._id,
        receiverId: alex._id,
        message: 'Hey Alex! Our compatibility score is 94%. We have identical sleep and cleanliness routines. Let us team up for an apartment!',
        isRead: true,
      },
      {
        senderId: alex._id,
        receiverId: jordan._id,
        message: 'Hey Jordan! That sounds awesome. I saw the 2BHK listings near Commonwealth Ave.',
        isRead: true,
      },
      {
        senderId: jordan._id,
        receiverId: alex._id,
        message: 'Perfect! When are you free this week to do a quick tour?',
        isRead: true,
      },
    ]);

    // Pending incoming request: Priya -> Alex
    await Request.create({
      senderId: priya._id,
      receiverId: alex._id,
      status: 'pending',
      message: 'Hi Alex! Saw your profile. We both prioritize silent study and keeping a clean kitchen.',
    });

    // Pending outgoing request: Alex -> Marcus
    await Request.create({
      senderId: alex._id,
      receiverId: marcus._id,
      status: 'pending',
      message: 'Hi Marcus! Love your architecture projects. Wondering if you would like to look for places near campus?',
    });

    // 4. Create Seed Moderation Reports for Admin view
    console.log('[Seed] Seeding safety moderation reports...');
    await Report.create([
      {
        reporterId: priya._id,
        reportedUserId: liam._id,
        reason: 'Misrepresented housing rules and loud late-night noise',
        description: 'Candidate stated quiet hours, but admitted to hosting loud parties on weekdays.',
        severity: 'medium',
        status: 'open',
      },
      {
        reporterId: samira._id,
        reportedUserId: liam._id,
        reason: 'Inappropriate communication regarding guest policy',
        description: 'Unsolicited messages pressuring roommate agreement.',
        severity: 'high',
        status: 'investigating',
      },
    ]);

    console.log('[Seed] Database successfully seeded with demo accounts!');
    console.log('---------------------------------------------------------');
    console.log('Demo Student: alex@university.edu / Password123!');
    console.log('Demo Admin:   admin@nestmatch.edu / AdminSecret123!');
    console.log('---------------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
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
