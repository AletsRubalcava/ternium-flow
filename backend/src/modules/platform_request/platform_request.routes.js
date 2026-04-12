import {Router} from 'express';
import { getAllPlatformsRequestsHandler, acceptPlatformRequestHandler, rejectPlatformRequestHandler, createPlatformRequestHandler } from './platform_request.controller.js';

const router = Router();

router.post('/', createPlatformRequestHandler);
router.get('/', getAllPlatformsRequestsHandler);
//router.get('/:id', getConsignatarioByIdHandler);
//router.put('/:id', updateConsigneeHandler);
//router.delete('/:id', deleteConsigneeHandler);
router.patch("/:id/accept", acceptPlatformRequestHandler);
router.patch("/:id/reject", rejectPlatformRequestHandler);

export default router;