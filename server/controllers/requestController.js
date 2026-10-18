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

  let newRequest;
  try {
    newRequest = await Request.create({
      senderId,
      receiverId,
      message: message || 'Hey! Saw our high compatibility score on NestMatch. Would love to connect!',
      status: 'pending',
      activePairKey: [senderId.toString(), receiverId.toString()].sort().join(':'),
    });
  } catch (err) {
    if (err.code === 11000) {
      return sendError(
        res,
        'An active roommate request already exists between you and this student.',
        409
      );
    }
    throw err;
  }

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
  // Atomic update: only a pending request addressed to this receiver can be accepted
  const request = await Request.findOneAndUpdate(
    {
      _id: req.params.id,
      receiverId: req.user._id,
      status: 'pending',
    },
    {
      $set: { status: 'accepted' },
    },
    { new: true }
  )
    .populate('senderId', 'name profileImage college')
    .populate('receiverId', 'name profileImage college');

  if (!request) {
    const existing = await Request.findById(req.params.id);
    if (!existing) {
      return sendError(res, 'Request not found', 404);
    }
    if (existing.receiverId.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to accept this request', 403);
    }
    if (existing.status === 'accepted') {
      return sendError(res, 'Request is already accepted', 400);
    }
    if (existing.status === 'rejected') {
      return sendError(res, 'Cannot accept a declined request', 400);
    }
    return sendError(res, `Cannot accept request with status '${existing.status}'`, 400);
  }

  // Seed welcome system message into the conversation thread (recoverable operation)
  let welcomeMessageCreated = false;
  try {
    await Message.create({
      senderId: request.receiverId._id,
      receiverId: request.senderId._id,
      message: `🤝 Connected! Roommate request accepted by ${req.user.name}. You can now message each other directly.`,
      isSystem: true,
    });
    welcomeMessageCreated = true;
  } catch (msgErr) {
    console.warn('[RequestController] Welcome message non-critical creation failure:', msgErr.message);
  }

  return sendSuccess(
    res,
    { request, welcomeMessageCreated },
    `Accepted roommate request from ${request.senderId.name}! Chat unlocked.`
  );
});

/**
 * @desc    Reject an incoming roommate request
 * @route   PUT /api/requests/:id/reject
 * @access  Private (JWT)
 */
export const rejectRequest = asyncHandler(async (req, res) => {
  // Atomic update: only pending request addressed to this receiver can be rejected
  const request = await Request.findOneAndUpdate(
    {
      _id: req.params.id,
      receiverId: req.user._id,
      status: 'pending',
    },
    {
      $set: {
        status: 'rejected',
        activePairKey: null, // Release unique pair constraint so valid future requests are allowed
      },
    },
    { new: true }
  );

  if (!request) {
    const existing = await Request.findById(req.params.id);
    if (!existing) {
      return sendError(res, 'Request not found', 404);
    }
    if (existing.receiverId.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to reject this request', 403);
    }
    if (existing.status === 'rejected') {
      return sendError(res, 'Request is already rejected', 400);
    }
    return sendError(res, `Cannot decline request with status '${existing.status}'`, 400);
  }

  return sendSuccess(res, { request }, 'Roommate request declined');
});

/**
 * @desc    Cancel an outgoing pending roommate request
 * @route   DELETE /api/requests/:id
 * @access  Private (JWT)
 */
export const cancelRequest = asyncHandler(async (req, res) => {
  // Atomic delete: only pending request sent by this student can be cancelled
  const request = await Request.findOneAndDelete({
    _id: req.params.id,
    senderId: req.user._id,
    status: 'pending',
  });

  if (!request) {
    const existing = await Request.findById(req.params.id);
    if (!existing) {
      return sendError(res, 'Request not found', 404);
    }
    if (existing.senderId.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to cancel this request', 403);
    }
    if (existing.status === 'accepted') {
      return sendError(res, 'Cannot cancel an already accepted connection', 400);
    }
    return sendError(res, `Cannot cancel request with status '${existing.status}'`, 400);
  }

  return sendSuccess(res, null, 'Roommate request canceled');
});
