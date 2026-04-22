import {Router} from 'express';
import { getAllPlatformsRequestsHandler, acceptPlatformRequestHandler, rejectPlatformRequestHandler, createPlatformRequestHandler, getPlatformRequestByIDHandler } from './platform_request.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

// Create: Operador and Administrador can create followUps
router.post('/', verifyToken, authorize('followUps', 'create'), createPlatformRequestHandler);
// Get all: all authorized roles can view
router.get('/', verifyToken, authorize('followUps', 'read'), getAllPlatformsRequestsHandler);
router.get("/:id", verifyToken, authorize('followUps', 'read'), getPlatformRequestByIDHandler);
// Accept/reject: Operador and Administrador can manage
router.patch("/:id/accept", verifyToken, authorize('followUps', 'manage'), acceptPlatformRequestHandler);
router.patch("/:id/reject", verifyToken, authorize('followUps', 'manage'), rejectPlatformRequestHandler);

export default router;