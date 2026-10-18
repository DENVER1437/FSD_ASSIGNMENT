import express from 'express';
import {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(protect);

router.post('/', sendRequest);
router.get('/received', getReceivedRequests);
router.get('/sent', getSentRequests);
router.put('/:id/accept', validateObjectId('id'), acceptRequest);
router.put('/:id/reject', validateObjectId('id'), rejectRequest);
router.delete('/:id', validateObjectId('id'), cancelRequest);

export default router;
