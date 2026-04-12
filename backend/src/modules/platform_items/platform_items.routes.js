import {Router} from 'express';
import { createPlatformItemHandler, getAllPlatformItemsHandler, getPlatformItemByIdHandler, updatePlatformItemHandler, deleteItemsByPlatformHandler } from './platform_items.controller.js';

const router = Router();

router.post('/', createPlatformItemHandler);
router.get('/', getAllPlatformItemsHandler);
router.get('/:id', getPlatformItemByIdHandler);
router.put('/:id', updatePlatformItemHandler);
router.delete('/:id', deleteItemsByPlatformHandler);

export default router;