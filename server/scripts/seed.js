import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Preference, Request, Message, Report } from '../models/index.js';
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
        Message.deleteMany({}),
        Report.deleteMany({}),
      ]);
    } else {
      console.log('[Seed] Idempotent upsert mode active. Preserving existing student accounts and upserting demo data...');
    }

    const defaultPassword = 'Password123!';
    const adminPassword = 'AdminSecret123!';

    // 1. Prepare demo users data
    console.log('[Seed] Processing demo users...');
    const demoUsersData = [
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

    const [alex, jordan, priya, marcus, samira, liam] = users;

    // 2. Create Preferences
    console.log('[Seed] Seeding lifestyle preferences...');
    const demoPreferences = [
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

    // 3. Create Seed Requests & Messages
    console.log('[Seed] Seeding roommate requests and message threads...');
    const demoRequests = [
      {
        senderId: jordan._id,
        receiverId: alex._id,
        status: 'accepted',
        message: 'Hey Alex! Our compatibility score is 94%. We have identical sleep and cleanliness routines. Let us team up for an apartment!',
      },
      {
        senderId: priya._id,
        receiverId: alex._id,
        status: 'pending',
        message: 'Hi Alex! Saw your profile. We both prioritize silent study and keeping a clean kitchen.',
      },
      {
        senderId: alex._id,
        receiverId: marcus._id,
        status: 'pending',
        message: 'Hi Marcus! Love your architecture projects. Wondering if you would like to look for places near campus?',
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

    // Seed conversation messages for Alex & Jordan
    if (isConfirm) {
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
    } else {
      const existingMsg = await Message.findOne({ senderId: jordan._id, receiverId: alex._id });
      if (!existingMsg) {
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
      }
    }

    // 4. Create Seed Moderation Reports for Admin view
    console.log('[Seed] Seeding safety moderation reports...');
    const demoReports = [
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

    console.log('[Seed] Database successfully synchronized with demo accounts!');
    console.log('---------------------------------------------------------');
    console.log('Demo Student: alex@university.edu / Password123!');
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
