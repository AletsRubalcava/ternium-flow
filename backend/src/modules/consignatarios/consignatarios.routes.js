import {Router} from 'express';
import { createConsigneeHandler, getAllConsignatariosHandler, getConsignatarioByIdHandler, updateConsigneeHandler, deleteConsigneeHandler } from './consignatarios.controller.js';
import { verifyToken, authorize, checkOwnership } from '../../middlewares/auth.js';

const router = Router();

// Create: only Administrador
router.post('/', verifyToken, authorize('consignatarios', 'create'), createConsigneeHandler);
router.get('/', verifyToken, authorize('consignatarios', 'read'), getAllConsignatariosHandler);
router.get('/:id', verifyToken, authorize('consignatarios', 'read'), getConsignatarioByIdHandler);
router.put('/:id', verifyToken, authorize('consignatarios', 'update'), updateConsigneeHandler);
router.delete('/:id', verifyToken, authorize('consignatarios', 'delete'), deleteConsigneeHandler);

export default router;