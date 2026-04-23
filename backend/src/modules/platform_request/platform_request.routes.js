import {Router} from 'express';
import { getAllPlatformsRequestsHandler, acceptPlatformRequestHandler, rejectPlatformRequestHandler, createPlatformRequestHandler, getPlatformRequestByIDHandler, deletePlatformRequestHandler} from './platform_request.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

router.post('/', verifyToken, authorize('requests', 'create'), createPlatformRequestHandler);
router.get('/', verifyToken, authorize('requests', 'read'), getAllPlatformsRequestsHandler);
router.get("/:id", verifyToken, authorize('requests', 'read'), getPlatformRequestByIDHandler);
router.patch("/:id/accept", verifyToken, authorize('requests', 'manage'), acceptPlatformRequestHandler);
router.patch("/:id/reject", verifyToken, authorize('requests', 'manage'), rejectPlatformRequestHandler);
router.delete('/:id', verifyToken, authorize('requests', 'delete'), deletePlatformRequestHandler);

export default router;