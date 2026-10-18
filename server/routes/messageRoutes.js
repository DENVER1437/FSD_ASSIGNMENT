import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { messageRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:otherUserId', validateObjectId('otherUserId'), getMessages);
router.post('/', messageRateLimiter, sendMessage);

export default router;
