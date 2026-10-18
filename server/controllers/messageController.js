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

  if (acceptedRequests.length === 0) {
    return sendSuccess(res, { conversations: [] }, 'No conversations found');
  }

  // 2. Identify all unique connected partners
  const partnerMap = new Map();
  const otherUserIds = [];

  for (const reqRecord of acceptedRequests) {
    const isSender = reqRecord.senderId._id.toString() === currentUserId.toString();
    const otherUser = isSender ? reqRecord.receiverId : reqRecord.senderId;

    if (!otherUser || otherUser.status === 'suspended') continue;

    const otherIdStr = otherUser._id.toString();
    if (!partnerMap.has(otherIdStr)) {
      partnerMap.set(otherIdStr, otherUser);
      otherUserIds.push(otherUser._id);
    }
  }

  if (otherUserIds.length === 0) {
    return sendSuccess(res, { conversations: [] }, 'No active conversations found');
  }

  // 3. Batched aggregation for unread counts across all active conversations (avoids N+1 queries)
  const unreadCounts = await Message.aggregate([
    {
      $match: {
        receiverId: currentUserId,
        senderId: { $in: otherUserIds },
        isRead: false,
      },
    },
    {
      $group: {
        _id: '$senderId',
        count: { $sum: 1 },
      },
    },
  ]);

  const unreadMap = new Map();
  unreadCounts.forEach((u) => unreadMap.set(u._id.toString(), u.count));

  // 4. Batched parallel query for latest message in each thread
  const latestMessagePromises = otherUserIds.map((otherId) =>
    Message.findOne({
      $or: [
        { senderId: currentUserId, receiverId: otherId },
        { senderId: otherId, receiverId: currentUserId },
      ],
    }).sort('-createdAt')
  );

  const latestMessages = await Promise.all(latestMessagePromises);
  const latestMsgMap = new Map();
  otherUserIds.forEach((otherId, idx) => {
    latestMsgMap.set(otherId.toString(), latestMessages[idx]);
  });

  // 5. Construct conversations list
  const conversations = [];
  for (const otherId of otherUserIds) {
    const otherIdStr = otherId.toString();
    const otherUser = partnerMap.get(otherIdStr);
    const lastMessage = latestMsgMap.get(otherIdStr);
    const unreadCount = unreadMap.get(otherIdStr) || 0;

    conversations.push({
      id: `conv-${otherIdStr}`,
      userId: otherIdStr,
      user: {
        id: otherIdStr,
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

  // Mark unread messages sent by otherUser as read (strictly restricted to recipient)
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

  if (!receiverId || typeof receiverId !== 'string') {
    return sendError(res, 'Valid receiver ID is required', 400);
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return sendError(res, 'Non-empty message content is required', 400);
  }

  if (message.trim().length > 1000) {
    return sendError(res, 'Message cannot exceed 1000 characters', 400);
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
