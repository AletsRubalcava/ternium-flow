import {Router} from 'express';
import { createPlatformItemHandler, getAllPlatformItemsHandler, getPlatformItemByIdHandler, updatePlatformItemHandler, deleteItemsByPlatformHandler } from './platform_items.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

// Create: Administrador only
router.post('/', verifyToken, authorize('tarimas', 'create'), createPlatformItemHandler);
// Get all: all authorized roles
router.get('/', verifyToken, authorize('tarimas', 'read'), getAllPlatformItemsHandler);
// Get by id: all authorized roles
router.get('/:id', verifyToken, authorize('tarimas', 'read'), getPlatformItemByIdHandler);
// Update: Administrador only
router.put('/:id', verifyToken, authorize('tarimas', 'update'), updatePlatformItemHandler);
// Delete: Administrador only
router.delete('/:id', verifyToken, authorize('tarimas', 'delete'), deleteItemsByPlatformHandler);

export default router;