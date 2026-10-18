import express from 'express';
import { getMyProfile, updateMyProfile, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);
router.get('/:id', validateObjectId('id'), getUserById);

export default router;
