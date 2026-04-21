import {Router} from 'express';
import { createConsigneeHandler, getAllConsignatariosHandler, getConsignatarioByIdHandler, updateConsigneeHandler, deleteConsigneeHandler } from './consignatarios.controller.js';
import { verifyToken, authorize, checkOwnership } from '../../middlewares/auth.js';

const router = Router();

// Create: only Administrador
router.post('/', verifyToken, authorize('consignatarios', 'create'), createConsigneeHandler);
// Get all: Administrador, Ejecutivo, Operador see all; Cliente sees own via filtering
router.get('/', verifyToken, authorize('consignatarios', 'read'), getAllConsignatariosHandler);
// Get by id: all authenticated users can read if authorized; Cliente can only read own
router.get('/:id', verifyToken, authorize('consignatarios', 'read'), checkOwnership('id'), getConsignatarioByIdHandler);
// Update: Administrador can update any, Cliente can update own
router.put('/:id', verifyToken, authorize('consignatarios', 'update'), checkOwnership('id'), updateConsigneeHandler);
// Delete: only Administrador
router.delete('/:id', verifyToken, authorize('consignatarios', 'delete'), deleteConsigneeHandler);

export default router;