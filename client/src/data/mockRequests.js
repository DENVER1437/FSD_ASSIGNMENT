/**
 * NestMatch Mock Roommate Requests Dataset
 * Tracks connection invitations across states (pending, accepted, rejected).
 */

export const MOCK_REQUESTS = [
  {
    id: 'req-1',
    senderId: 'user-1',
    sender: {
      id: 'user-1',
      name: 'Jordan Lee',
      college: 'Apex Institute of Technology',
      city: 'Boston',
      course: 'B.S. Data Science',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
      score: 94,
    },
    receiverId: 'user-me',
    status: 'pending',
    type: 'received',
    message: 'Hey Meet! Saw we both have a 94% compatibility and night owl schedules. Would love to team up for a flat near campus!',
    createdAt: '2026-10-10T14:30:00Z',
  },
  {
    id: 'req-2',
    senderId: 'user-me',
    receiverId: 'user-2',
    receiver: {
      id: 'user-2',
      name: 'Priya Sharma',
      college: 'Apex Institute of Technology',
      city: 'Boston',
      course: 'B.Tech Information Technology',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      score: 88,
    },
    status: 'pending',
    type: 'sent',
    message: 'Hi Priya, our study habits and vegetarian preferences match very closely. Let me know if you are looking for a roommate this term!',
    createdAt: '2026-10-11T09:15:00Z',
  },
  {
    id: 'req-3',
    senderId: 'user-3',
    sender: {
      id: 'user-3',
      name: 'Marcus Taylor',
      college: 'Metro State University',
      city: 'Boston',
      course: 'B.A. Graphic & UI Design',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      score: 82,
    },
    receiverId: 'user-me',
    status: 'accepted',
    type: 'accepted',
    message: 'Great connecting with you! Looking forward to viewing apartments together.',
    createdAt: '2026-10-08T11:20:00Z',
    updatedAt: '2026-10-09T16:00:00Z',
  },
];
