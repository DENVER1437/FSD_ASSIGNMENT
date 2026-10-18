import express from 'express';
import { getMatches, getMatchDetails } from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);

router.get('/', getMatches);
router.get('/:id', validateObjectId('id'), getMatchDetails);

export default router;
