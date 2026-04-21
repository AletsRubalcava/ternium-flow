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

// Get all: all authorized roles can read tarimas
router.get('/',     verifyToken, authorize('tarimas', 'read'), getAllPlatformsHandler);
// Get by id: all authorized roles can read
router.get('/:id',  verifyToken, authorize('tarimas', 'read'), getPlatformByIdHandler);
// Create: only Administrador
router.post('/',    verifyToken, authorize('tarimas', 'create'), createPlatformHandler);
// Update: only Administrador (Cliente can adjust physical constraints but that's special handling in controller)
router.put('/:id',  verifyToken, authorize('tarimas', 'update'), updatePlatformHandler);
// Delete: only Administrador
router.delete('/:id', verifyToken, authorize('tarimas', 'delete'), deletePlatformHandler);

export default router;