import { Message } from '../models/Message.js';
import { Request } from '../models/Request.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Helper: verify that two students have an accepted connection
 */
const verifyAcceptedConnection = async (userA, userB) => {
  return Request.findOne({
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA },
    ],
    status: 'accepted',
  });
};

/**
 * @desc    Get all active conversation threads for current student
 * @route   GET /api/messages/conversations
 * @access  Private (JWT)
 */
export const getConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  // 1. Find all accepted roommate requests
  const acceptedRequests = await Request.find({
    $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    status: 'accepted',
  })
    .populate('senderId', 'name email college city course profileImage status')
    .populate('receiverId', 'name email college city course profileImage status');

  const conversations = [];

  for (const reqRecord of acceptedRequests) {
    const isSender = reqRecord.senderId._id.toString() === currentUserId.toString();
    const otherUser = isSender ? reqRecord.receiverId : reqRecord.senderId;

    if (!otherUser || otherUser.status === 'suspended') continue;

    // Fetch last message in this thread
    const lastMessage = await Message.findOne({
      $or: [
        { senderId: currentUserId, receiverId: otherUser._id },
        { senderId: otherUser._id, receiverId: currentUserId },
      ],
    }).sort('-createdAt');

    // Count unread
    const unreadCount = await Message.countDocuments({
      senderId: otherUser._id,
      receiverId: currentUserId,
      isRead: false,
    });

    conversations.push({
      id: `conv-${otherUser._id.toString()}`,
      userId: otherUser._id.toString(),
      user: {
        id: otherUser._id.toString(),
        name: otherUser.name,
        college: otherUser.college,
        course: otherUser.course,
        profileImage: otherUser.profileImage,
        status: 'online',
      },
      lastMessage: lastMessage ? lastMessage.message : 'Connection accepted. Say hello!',
      lastMessageTime: lastMessage
        ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now',
      unreadCount,
    });
  }

  return sendSuccess(res, { conversations }, 'Conversations retrieved');
});

/**
 * @desc    Get message history between current student and connected candidate
 * @route   GET /api/messages/:otherUserId
 * @access  Private (JWT)
 */
export const getMessages = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { otherUserId } = req.params;

  const isConnected = await verifyAcceptedConnection(currentUserId, otherUserId);
  if (!isConnected) {
    return sendError(
      res,
      'Direct messaging is only available between mutually connected roommates.',
      403
    );
  }

  const messages = await Message.find({
    $or: [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId },
    ],
  }).sort('createdAt');

  // Mark unread messages sent by otherUser as read
  await Message.updateMany(
    { senderId: otherUserId, receiverId: currentUserId, isRead: false },
    { $set: { isRead: true } }
  );

  const formatted = messages.map((m) => ({
    id: m._id.toString(),
    senderId: m.senderId.toString(),
    text: m.message,
    timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMe: m.senderId.toString() === currentUserId.toString(),
    isSystem: m.isSystem,
  }));

  return sendSuccess(res, { messages: formatted }, 'Message history retrieved');
});

/**
 * @desc    Send a message to a connected roommate
 * @route   POST /api/messages
 * @access  Private (JWT)
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { receiverId, message } = req.body;

  if (!receiverId || !message || !message.trim()) {
    return sendError(res, 'Receiver ID and non-empty message content are required', 400);
  }

  const isConnected = await verifyAcceptedConnection(currentUserId, receiverId);
  if (!isConnected) {
    return sendError(
      res,
      'Direct messaging is only permitted between mutually accepted roommate pairs.',
      403
    );
  }

  const newMsg = await Message.create({
    senderId: currentUserId,
    receiverId,
    message: message.trim(),
    isRead: false,
    isSystem: false,
  });

  return sendSuccess(
    res,
    {
      message: {
        id: newMsg._id.toString(),
        senderId: newMsg.senderId.toString(),
        text: newMsg.message,
        timestamp: 'Just now',
        isMe: true,
      },
    },
    'Message sent',
    201
  );
});
