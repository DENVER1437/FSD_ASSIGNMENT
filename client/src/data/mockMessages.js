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
      name: 'Marcus Taylor',
      college: 'Metro State University',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      status: 'online',
    },
    lastMessage: 'Sounds good! Let me check the listing near Tremont St.',
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
        text: 'Yeah, I found a couple of 2-bedroom units near the subway line within our $5k-$8k budget.',
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
