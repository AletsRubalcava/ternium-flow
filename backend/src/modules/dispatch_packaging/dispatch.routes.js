import { Router } from 'express';
import {
    getDispatchByIdHandler,
    getAllDispatchesHandler,
    createDispatchHandler,
    deleteDispatchHandler
} from './dispatch.controller.js';
import { verifyToken, authorize } from '../../middlewares/auth.js';

const router = Router();

router.get('/',   getAllDispatchesHandler);
router.get('/:id',   getDispatchByIdHandler);
router.post('/', createDispatchHandler);
router.delete('/:id', deleteDispatchHandler);

export default router;