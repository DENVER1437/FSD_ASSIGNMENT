import { User } from '../models/User.js';
import { Preference } from '../models/Preference.js';
import { Request } from '../models/Request.js';
import { Report } from '../models/Report.js';
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
 * Helper to safely escape regex special characters from user inputs
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @desc    Get paginated and searchable user list
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { search, role, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (search && typeof search === 'string' && search.trim()) {
    const escaped = escapeRegex(search.trim());
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
      { college: { $regex: escaped, $options: 'i' } },
    ];
  }

  if (role && role !== 'all') {
    if (!['student', 'admin'].includes(role)) {
      return sendError(res, "Invalid role filter. Allowed values: 'student', 'admin'", 400);
    }
    query.role = role;
  }

  if (status && status !== 'all') {
    if (!['active', 'suspended'].includes(status)) {
      return sendError(res, "Invalid status filter. Allowed values: 'active', 'suspended'", 400);
    }
    query.status = status;
  }

  const rawPage = Number(page);
  const rawLimit = Number(limit);

  if (isNaN(rawPage) || rawPage < 1) {
    return sendError(res, 'Page parameter must be a positive integer greater than or equal to 1', 400);
  }

  if (isNaN(rawLimit) || rawLimit < 1) {
    return sendError(res, 'Limit parameter must be a positive integer between 1 and 100', 400);
  }

  if (rawLimit > 100) {
    return sendError(res, 'Limit parameter cannot exceed maximum of 100', 400);
  }

  const limitNum = Math.floor(rawLimit);
  const pageNum = Math.floor(rawPage);
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
  const validStatuses = ['open', 'investigating', 'resolved', 'dismissed'];

  if (status && status !== 'all') {
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid report status filter. Allowed values: ${validStatuses.join(', ')}`, 400);
    }
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
  const validStatuses = ['open', 'investigating', 'resolved', 'dismissed'];

  if (status && !validStatuses.includes(status)) {
    return sendError(res, `Invalid report status. Allowed values: ${validStatuses.join(', ')}`, 400);
  }

  const report = await Report.findById(req.params.id);
  if (!report) {
    return sendError(res, 'Report not found', 404);
  }

  if (status) report.status = status;
  if (adminNotes && typeof adminNotes === 'string') report.adminNotes = adminNotes.trim();

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
