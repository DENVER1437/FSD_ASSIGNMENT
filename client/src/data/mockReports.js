/**
 * NestMatch Mock Admin Reports Dataset
 * Sample moderation incidents and flag logs.
 */

export const MOCK_REPORTS = [
  {
    id: 'rep-1',
    reporterId: 'user-2',
    reporterName: 'Priya Sharma',
    reportedUserId: 'user-6',
    reportedUserName: 'Liam O’Connor',
    reason: 'Inappropriate language and spam messages on off-platform invite link.',
    category: 'Conduct Violation',
    status: 'pending',
    createdAt: '2026-10-12T08:30:00Z',
    severity: 'medium',
  },
  {
    id: 'rep-2',
    reporterId: 'user-4',
    reporterName: 'Samantha Wu',
    reportedUserId: 'user-fake-1',
    reportedUserName: 'Suspicious Profile',
    reason: 'Suspected commercial broker posing as a university student.',
    category: 'Impersonation',
    status: 'reviewed',
    createdAt: '2026-10-10T14:15:00Z',
    severity: 'high',
  },
  {
    id: 'rep-3',
    reporterId: 'user-1',
    reporterName: 'Jordan Lee',
    reportedUserId: 'user-inactive-1',
    reportedUserName: 'Ghost Account',
    reason: 'Account unresponsive after confirming lease agreement.',
    category: 'Misleading Listing',
    status: 'resolved',
    createdAt: '2026-10-05T19:00:00Z',
    severity: 'low',
  },
];
