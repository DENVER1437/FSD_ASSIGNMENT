import express from 'express';
import { getMyPreferences, updateMyPreferences } from '../controllers/preferenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyPreferences);
router.put('/', updateMyPreferences);

export default router;
