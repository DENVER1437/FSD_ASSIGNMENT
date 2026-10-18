import { User } from '../models/User.js';
import { Preference } from '../models/Preference.js';
import { Request } from '../models/Request.js';
import { Report } from '../models/Report.js';
import { Message } from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @desc    Get administrative metrics and platform statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalStudents, totalUsers, completedSurveys, totalConnections, openReports, recentReports] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments(),
      Preference.countDocuments(),
      Request.countDocuments({ status: 'accepted' }),
      Report.countDocuments({ status: { $in: ['open', 'investigating'] } }),
      Report.find()
        .populate('reporterId', 'name email')
        .populate('reportedUserId', 'name email')
        .sort('-createdAt')
        .limit(5),
    ]);

  return sendSuccess(
    res,
    {
      totalUsers,
      totalStudents,
      completedSurveys,
      totalConnections,
      openReports,
      metrics: {
        totalUsers,
        totalStudents,
        completedSurveys,
        totalConnections,
        openReports,
      },
      recentReports,
    },
    'Admin dashboard metrics retrieved'
  );
});

/**
 * @desc    Get paginated and searchable user list
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { search, role, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (search && search.trim()) {
    const q = search.trim();
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { college: { $regex: q, $options: 'i' } },
    ];
  }

  if (role && role !== 'all') query.role = role;
  if (status && status !== 'all') query.status = status;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(limitNum),
    User.countDocuments(query),
  ]);

  return sendSuccess(
    res,
    {
      users: users.map((u) => u.toSafeObject()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    },
    'Users list retrieved'
  );
});

/**
 * @desc    Toggle student account status (active vs suspended)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['active', 'suspended'].includes(status)) {
    return sendError(res, "Status must be either 'active' or 'suspended'", 400);
  }

  // Prevent admin from suspending self
  if (req.user._id.toString() === req.params.id) {
    return sendError(res, 'Administrators cannot modify their own account status', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { status } },
    { new: true }
  );

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, { user: user.toSafeObject() }, `Account status updated to ${status}`);
});

/**
 * @desc    Delete user account and cascade associated data
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    return sendError(res, 'Administrators cannot delete their own account', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Cascade cleanup of related student records
  await Promise.all([
    User.findByIdAndDelete(req.params.id),
    Preference.deleteMany({ userId: req.params.id }),
    Request.deleteMany({
      $or: [{ senderId: req.params.id }, { receiverId: req.params.id }],
    }),
    Message.deleteMany({
      $or: [{ senderId: req.params.id }, { receiverId: req.params.id }],
    }),
  ]);

  return sendSuccess(res, null, 'User account and associated records deleted');
});

/**
 * @desc    Get safety moderation reports
 * @route   GET /api/admin/reports
 * @access  Private (Admin only)
 */
export const getReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  const reports = await Report.find(filter)
    .populate('reporterId', 'name email college profileImage')
    .populate('reportedUserId', 'name email college profileImage status')
    .sort('-createdAt');

  return sendSuccess(res, { reports }, 'Moderation reports retrieved');
});

/**
 * @desc    Update report status or take moderation action
 * @route   PUT /api/admin/reports/:id
 * @access  Private (Admin only)
 */
export const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, action, adminNotes } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) {
    return sendError(res, 'Report not found', 404);
  }

  if (status) report.status = status;
  if (adminNotes) report.adminNotes = adminNotes;

  // Execute moderation action if requested
  if (action === 'suspend_user') {
    await User.findByIdAndUpdate(report.reportedUserId, { status: 'suspended' });
    report.status = 'resolved';
    report.adminNotes = (report.adminNotes || '') + ' [Action: User suspended by admin]';
  } else if (action === 'dismiss') {
    report.status = 'dismissed';
  }

  await report.save();

  return sendSuccess(res, { report }, 'Report updated successfully');
});
