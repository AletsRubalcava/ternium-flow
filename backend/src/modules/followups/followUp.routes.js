import { Router } from 'express';
import { createFollowUpHandler, updateFollowUpHandler, getAllFollowUpsHandler, getFollowUpsByIdHandler } from './followUp.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

router.post('/',    verifyToken, authorize('followUps', 'create'), createFollowUpHandler);
router.patch('/:id', verifyToken, authorize('followUps', 'update'), updateFollowUpHandler);
router.get('/',     verifyToken, authorize('followUps', 'read'),   getAllFollowUpsHandler);
router.get('/:id',  verifyToken, authorize('followUps', 'read'),   getFollowUpsByIdHandler);

export default router;