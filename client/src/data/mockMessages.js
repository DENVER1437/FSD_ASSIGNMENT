/**
 * NestMatch Mock Chat Messages Dataset
 * Realistic message threads for accepted roommate connections.
 */

export const MOCK_CONVERSATIONS = [
  {
    id: 'conv-user-3',
    userId: 'user-3',
    user: {
      id: 'user-3',
      name: 'Dhruv Shah',
      college: 'DA-IICT',
      profileImage: '',
      status: 'online',
    },
    lastMessage: 'Sounds good! Let me check the listing near SG Highway.',
    lastMessageTime: '10:45 AM',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-3',
        text: 'Hey Meet! Thanks for accepting the roommate request.',
        timestamp: 'Yesterday, 4:15 PM',
        isMe: false,
      },
      {
        id: 'msg-2',
        senderId: 'user-me',
        text: 'Hey Marcus! Happy to connect. Have you started looking for apartments yet?',
        timestamp: 'Yesterday, 4:20 PM',
        isMe: true,
      },
      {
        id: 'msg-3',
        senderId: 'user-3',
        text: 'Yeah, I found a couple of 2-bedroom units near the BRTS corridor within our ₹5,000–₹8,000 budget.',
        timestamp: 'Yesterday, 4:22 PM',
        isMe: false,
      },
      {
        id: 'msg-4',
        senderId: 'user-me',
        text: 'Awesome. Would you be free to do an in-person tour this Saturday?',
        timestamp: 'Today, 10:30 AM',
        isMe: true,
      },
      {
        id: 'msg-5',
        senderId: 'user-3',
        text: 'Sounds good! Let me check the listing near Tremont St.',
        timestamp: 'Today, 10:45 AM',
        isMe: false,
      },
    ],
  },
];
