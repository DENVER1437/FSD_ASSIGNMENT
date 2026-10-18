import { Request } from '../models/Request.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @desc    Send a roommate request to a candidate student
 * @route   POST /api/requests
 * @access  Private (JWT)
 */
export const sendRequest = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId, message } = req.body;

  if (!receiverId) {
    return sendError(res, 'Receiver student ID is required', 400);
  }

  if (senderId.toString() === receiverId.toString()) {
    return sendError(res, 'You cannot send a roommate request to yourself', 400);
  }

  const receiver = await User.findById(receiverId);
  if (!receiver || receiver.status === 'suspended') {
    return sendError(res, 'Target student not found or inactive', 404);
  }

  // Check if active request already exists between this pair
  const existingRequest = await Request.findOne({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
    status: { $in: ['pending', 'accepted'] },
  });

  if (existingRequest) {
    return sendError(
      res,
      existingRequest.status === 'accepted'
        ? 'You are already connected as roommates!'
        : 'An active roommate request is already pending with this student.',
      409
    );
  }

  const newRequest = await Request.create({
    senderId,
    receiverId,
    message: message || 'Hey! Saw our high compatibility score on NestMatch. Would love to connect!',
    status: 'pending',
  });

  const populated = await Request.findById(newRequest._id)
    .populate('receiverId', 'name email college city course profileImage');

  return sendSuccess(
    res,
    {
      request: {
        id: populated._id.toString(),
        senderId: populated.senderId.toString(),
        receiverId: populated.receiverId._id.toString(),
        receiver: populated.receiverId,
        status: populated.status,
        message: populated.message,
        createdAt: populated.createdAt,
      },
    },
    `Roommate request sent to ${receiver.name}!`,
    201
  );
});

/**
 * @desc    Get all incoming roommate requests for current student
 * @route   GET /api/requests/received
 * @access  Private (JWT)
 */
export const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ receiverId: req.user._id })
    .populate('senderId', 'name email college city course profileImage')
    .sort('-createdAt');

  const formatted = requests.map((r) => ({
    id: r._id.toString(),
    senderId: r.senderId?._id?.toString(),
    receiverId: r.receiverId.toString(),
    sender: r.senderId,
    status: r.status,
    type: 'received',
    message: r.message,
    createdAt: r.createdAt,
  }));

  return sendSuccess(res, { requests: formatted }, 'Received requests retrieved');
});

/**
 * @desc    Get all outgoing roommate requests sent by current student
 * @route   GET /api/requests/sent
 * @access  Private (JWT)
 */
export const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ senderId: req.user._id })
    .populate('receiverId', 'name email college city course profileImage')
    .sort('-createdAt');

  const formatted = requests.map((r) => ({
    id: r._id.toString(),
    senderId: r.senderId.toString(),
    receiverId: r.receiverId?._id?.toString(),
    receiver: r.receiverId,
    status: r.status,
    type: 'sent',
    message: r.message,
    createdAt: r.createdAt,
  }));

  return sendSuccess(res, { requests: formatted }, 'Sent requests retrieved');
});

/**
 * @desc    Accept an incoming roommate request
 * @route   PUT /api/requests/:id/accept
 * @access  Private (JWT)
 */
export const acceptRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id)
    .populate('senderId', 'name profileImage college')
    .populate('receiverId', 'name profileImage college');

  if (!request) {
    return sendError(res, 'Request not found', 404);
  }

  // Only the receiver can accept
  if (request.receiverId._id.toString() !== req.user._id.toString()) {
    return sendError(res, 'You are not authorized to accept this request', 403);
  }

  if (request.status === 'accepted') {
    return sendError(res, 'Request is already accepted', 400);
  }

  request.status = 'accepted';
  await request.save();

  // Automatically seed initial system welcome message into the thread
  await Message.create({
    senderId: request.receiverId._id,
    receiverId: request.senderId._id,
    message: `🤝 Connected! Roommate request accepted by ${req.user.name}. You can now message each other directly.`,
    isSystem: true,
  });

  return sendSuccess(
    res,
    { request },
    `Accepted roommate request from ${request.senderId.name}! Chat unlocked.`
  );
});

/**
 * @desc    Reject an incoming roommate request
 * @route   PUT /api/requests/:id/reject
 * @access  Private (JWT)
 */
export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return sendError(res, 'Request not found', 404);
  }

  if (request.receiverId.toString() !== req.user._id.toString()) {
    return sendError(res, 'You are not authorized to reject this request', 403);
  }

  request.status = 'rejected';
  await request.save();

  return sendSuccess(res, { request }, 'Roommate request declined');
});

/**
 * @desc    Cancel an outgoing pending roommate request
 * @route   DELETE /api/requests/:id
 * @access  Private (JWT)
 */
export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return sendError(res, 'Request not found', 404);
  }

  if (request.senderId.toString() !== req.user._id.toString()) {
    return sendError(res, 'You are not authorized to cancel this request', 403);
  }

  await Request.findByIdAndDelete(req.params.id);

  return sendSuccess(res, null, 'Roommate request canceled');
});
