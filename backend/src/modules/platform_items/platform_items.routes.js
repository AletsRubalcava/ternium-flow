import {Router} from 'express';
import { createPlatformItemHandler, getAllPlatformItemsHandler, getPlatformItemByIdHandler, updatePlatformItemHandler, deletePlatformItemHandler } from './platform_items.controller.js';

const router = Router();

router.post('/', createPlatformItemHandler);
router.get('/', getAllPlatformItemsHandler);
router.get('/:id', getPlatformItemByIdHandler);
router.put('/:id', updatePlatformItemHandler);
router.delete('/:id', deletePlatformItemHandler);

export default router;