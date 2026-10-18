import express from 'express';
import { getMyProfile, updateMyProfile, updateMySettings, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);
router.put('/settings', updateMySettings);
router.get('/:id', validateObjectId('id'), getUserById);

export default router;
