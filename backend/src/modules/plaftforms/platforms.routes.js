import { Router } from 'express';
import {
    getAllPlatformsHandler,
    getPlatformByIdHandler,
    createPlatformHandler,
    updatePlatformHandler,
    deletePlatformHandler
} from './platforms.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

router.get('/',     verifyToken, authorize('tarimas', 'read'), getAllPlatformsHandler);
router.get('/:id',  verifyToken, authorize('tarimas', 'read'), getPlatformByIdHandler);
router.post('/',    verifyToken, authorize('tarimas', 'create'), createPlatformHandler);
router.put('/:id',  verifyToken, authorize('tarimas', 'update'), updatePlatformHandler);
router.delete('/:id', verifyToken, authorize('tarimas', 'delete'), deletePlatformHandler);

export default router;