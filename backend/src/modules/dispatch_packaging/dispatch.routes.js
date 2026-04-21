import {Router} from 'express';
import { getDispatchByIdHandler, getAllDispatchesHandler } from './dispatch.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

// Read-only: all authenticated users can view dispatch packaging info
router.get('/', verifyToken, authorize('productos', 'read'), getAllDispatchesHandler);
router.get('/:id', verifyToken, authorize('productos', 'read'), getDispatchByIdHandler);

export default router;
