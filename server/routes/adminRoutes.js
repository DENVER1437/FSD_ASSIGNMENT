import express from 'express';
import {
  getAdminDashboard,
  getUsers,
  updateUserStatus,
  deleteUser,
  getReports,
  updateReportStatus,
  getAcceptedPairs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All admin routes require JWT and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/metrics', getAdminDashboard);
router.get('/users', getUsers);
router.get('/accepted-pairs', getAcceptedPairs);
router.put('/users/:id/status', validateObjectId('id'), updateUserStatus);
router.delete('/users/:id', validateObjectId('id'), deleteUser);
router.get('/reports', getReports);
router.put('/reports/:id', validateObjectId('id'), updateReportStatus);

export default router;
