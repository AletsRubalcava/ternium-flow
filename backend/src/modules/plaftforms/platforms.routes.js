import { Router } from 'express';
import {
    getAllPlatformsHandler,
    getPlatformByIdHandler,
    createPlatformHandler,
    updatePlatformHandler,
    deletePlatformHandler
} from './platforms.controller.js';

const router = Router();

router.get('/',     getAllPlatformsHandler);
router.get('/:id',  getPlatformByIdHandler);
router.post('/',    createPlatformHandler);
router.put('/:id',  updatePlatformHandler);
router.delete('/:id', deletePlatformHandler);

export default router;