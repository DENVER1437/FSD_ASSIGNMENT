import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:otherUserId', validateObjectId('otherUserId'), getMessages);
router.post('/', sendMessage);

export default router;
