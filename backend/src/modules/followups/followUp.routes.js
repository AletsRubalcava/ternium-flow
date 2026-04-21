import { Router } from 'express';
import { createFollowUpHandler, updateFollowUpHandler, getAllFollowUpsHandler, getFollowUpsByIdHandler } from './followUp.controller.js';
const router = Router();

router.post('/',    createFollowUpHandler);
router.patch('/:id',  updateFollowUpHandler);
router.get('/',     getAllFollowUpsHandler);
router.get('/:id',  getFollowUpsByIdHandler)

export default router;